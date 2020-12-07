
var fs;
var directory;
function readFileFromDevice(fileName) {

    Implen.DEVICEFILESYSTEM.root.getFile(fileName, null, gotFileEntry, fail);

}
function gotFileEntry(fileEntry) {
    fileEntry.file(gotFile, fail);
}

function gotFile(file) {
    readAsText(file);
}

function readAsText(file) {
    var reader = new FileReader(),
        storages = Ext.ComponentQuery.query('Storages')[0];
    reader.onloadend = function (evt) {
        var decrypt = Ext.create('Implen.data.reader.Decrypt'),
            rawData,
            implenDocumentSource,
            decodedString = decrypt.decrypt(evt.target.result);
        rawData = JSON.parse(decodedString);
        implenDocumentSource =
            Ext.create('Implen.model.ImplenDocumentSource',
                rawData);
        storages.fireEvent('fileread', file, implenDocumentSource, rawData);
    };
    reader.readAsText(file);
}

function fail(error) {
    //console.log(error.code);
    Ext.defer(function () {
        Ext.Viewport.setMasked(false);
    }, 1000);
}

function onDeviceReady() {
    if (Ext.os.is.iOS) {
     if (window.screen.width >= 768 && screen) {
     screen.lockOrientation('landscape');
     //alert("is a Tablet");
     } else if (screen) {
     screen.lockOrientation('portrait');
     //alert("is a phone");
     }
     }
    /*if (window.screen.width >= 768 && screen) {
        screen.lockOrientation('landscape');
        //alert("is a Tablet");
    } else if (screen) {
        screen.lockOrientation('portrait');
        //alert("is a phone");
    }*/
   // alert('on device ready');
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onRequestFileSystemSuccess, onRequestFileSystemError);

}
function onRequestFileSystemSuccess(fileSystem) {
    Implen.DEVICEFILESYSTEM = fs = fileSystem;


    fileSystem.root.getDirectory(CONSTANTS.IOSSAVEFOLDERNAME, {create: true, exclusive: false}, onGetDirectorySuccess, onGetDirectoryFail);

}
function onErrorCreateFile(err){
    alert("Error in creating file");
}
function onRequestFileSystemError(err) {
    alert("Error in reading file");
}


function onGetDirectorySuccess(dir) {
    directory = dir;
    Implen.DEVICEFILESYSTEM.root.fullPath = Implen.DEVICEFILESYSTEM.root.fullPath + CONSTANTS.IOSSAVEFOLDERNAME;
    // fileSystem.root.getFile(fs.root.fullPath+"newPersistentFile.pdf", { create: true, exclusive: false }, function (fileEntry) {
    //
    //     console.log("fileEntry is file?" + fileEntry.isFile.toString());
    //     writeFile(fileEntry, "nanophotometer pdf file");
    //
    // }, onErrorCreateFile);
}

function onGetDirectoryFail(error) {
    alert("Error creating directory " + error.code);
}
function errorHandler(err) {
    alert("Error Handler");

}

function ReadDirectory() {
    var dirReader = Implen.DEVICEFILESYSTEM.root.createReader(),
        msgObj;
    dirReader.readEntries(function (entries) {
        if (!entries.length) {

            //todo
            Popup.showDialog({
                message : Lang.warning_ImplenFolderEmpty,
                type: Implen.Constants.messageType.warning,
                showCloseBtn:true,
            });
            //NanoSenchaTouch2.view.dialog.Popup.showPopupDialog(msgObj);

        }
        Implen.files = entries;
    }, errorHandler);

}

function writeDirectory() {
    Implen.DEVICEFILESYSTEM.root.getFile( Implen.nameFor, {create: true, exclusive: false}, writeFile, fail);
}

function writeFile(fileEntry) {
    fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
    writer.write(Implen.responseFor);
    Ext.defer(function () {
        Ext.Viewport.setMasked(false);
    }, 1000);
}

/*function openFile(fileName) {
 var filePath = fs.root.toURL() + directoryName + "/" + fileName;
 //alert('download path ---- ' + filePath);
 cordova.exec(successHandler, failureHandler, "DocumentHandler", "HandleDocumentWithURL", [{"url" : filePath}]);
 if (successHandler) {
 Ext.defer(function () {
 Ext.Viewport.setMasked(false);
 }, 300);
 }
 }*/

function saveToDevice(url, success, failure) {
    var fileTransfer = new FileTransfer(),
        downloadedDocumentDirectoryFileName = Implen.DEVICEFILESYSTEM.root.toURL() + CONSTANTS.IOSSAVEFOLDERNAME + "/" + Implen.nameFor,
        uri = encodeURI(url);
    fileTransfer.download(
        uri,
        downloadedDocumentDirectoryFileName,
        function (entry) {
            //alert("download complete: " + entry.fullPath);
            //setTimeout('openFile()', 1000);
            if (success) {
                success();
            }
        },
        function (error) {
            //alert("download error source " + error.source);
            //alert("download error target " + error.target);
            //alert("upload error code" + error.code);
            if (failure) {
                failure();
            }
        }
    );
}

function successHandler() {
    //alert("successHandler");
}

function failureHandler() {
    //alert("failureHandler");
}
function openXLSXFile(fileName) {
   // alert('enter in xlsx file');
    var importFolder=cordova.file.externalDataDirectory,
        url = Ext.os.is.Android ?  importFolder+fileName : Implen.DEVICEFILESYSTEM.root.toURL()+CONSTANTS.IOSSAVEFOLDERNAME+ "/" + fileName;
    //alert('open file location -----' + url);

    if (Ext.os.is.iOS) {
        window.open(url, '_blank');
    } else if (Ext.os.is.Android) {

        var filePath = url,
            fileMIMEType;

        if (fileName.toLowerCase().endsWith('.pdf')){
            fileMIMEType = 'application/pdf';
        }
        if (fileName.toLowerCase().endsWith('.xlsx')){
            fileMIMEType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        cordova.plugins.fileOpener2.open(
            filePath,
            fileMIMEType,
            {
                error : function(){
                    //alert('fail');
                },
                success : function(){
                    //alert('success');
                }
            }
        );
    }
    Ext.defer(function () {
        Ext.Viewport.setMasked(false);
    }, 300);
}