const { log } = require("console");


/*
* Retun the extension and mime type of a file
*
* @param string filename 
*/
const getFileType = (filename) => {
    let buffer = readChunk.sync(filename, 0, fileType.minimumBytes);
    return fileType(buffer);
}

/**
* Uncompress files in given folder 
* @param string folderName
*/
const uncompressFiles = async (folderName) => {
    log.info(`Uncompressing files in ${folderName} ...`)
    let files = fs.readdirSync(folderName, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

    let promiseArray = []

    for (let i = 0; i < files.length; i++) {
        let filename = files[i];
        let filePath = path.join(folderName, filename)
        let fType = getFileType(filePath);

        try {
            if (fType.ext === 'gz' && fType.mime === 'application/gzip') {
                promiseArray.push(
                    new Promise((resolve, reject) => {

                        gunzip(filePath, filePath.replace('.gz', ''), function () {
                            log.info(`[parse_cm_job] Uncompressed  ${filename} successfully.`)
                            resolve(`Uncompressed  ${filename}. `)
                        });

                    })
                );
            } else {
                log.info(`[parse_cm_job] Skip uncompressing of ${filePath}`);
            }
        } catch (e) {
            log.info(`[parse_cm_job] file:${filename} fType:${fType} error:${e.toString()}`)
        }
    }

    let r = await Promise.all(promiseArray)
    return r
}

/*
* Use gunzip on windows.
* This is a work around to handle large files which are a problem for nodejs
* 
* @param string inputFile 
*/
const winGunzipFile = (inputFile) => {
    let libPath = app.getAppPath();

    if (!isDev) {
        libPath = process.resourcesPath;
    }

    const gzip = path.join(libPath, 'libraries', 'gzip.exe');

    const child = spawnSync(gzip, ['-d', inputFile]);
    log.info(`${gzip} -d ${inputFile}`);

    if (child.error) {
        throw child.error.toString();
    }
}

/*
* Uncompress with 7z
*
*@param string fileName
*@param string targetFolder
*/
const unCompressFile = (fileName, targetFolder) => {
    let libPath = app.getAppPath();
    if (!isDev) {
        libPath = process.resourcesPath;
    }

    //Windows
    if (process.platform === "win32") {
        let sevenZip = path.join(libPath, 'libraries', '7z.exe');

        const child = spawnSync(sevenZip, ['e', fileName, "-o" + targetFolder, "-y"]);

        log.info(`${sevenZip} e ${fileName} -o${targetFolder}`);
        log.info(`${child.stderr.toString()}`);

        if (child.error) {
            throw child.error.toString();
        } else {
            log.info(child.stdout.toString());
        }

    } else {

        let mime = getFileType(fileName).mime;

        //zip
        if (mime === 'application/zip') {
            extractZip(fileName, targetFolder);
        }

        //tar or tgz/tar.gz
        if (mime === 'application/x-tar' || 'application/x-gtar') {
            extractTar(fileName, targetFolder);
        }

        //rar
        if (mime === 'application/x-rar-compressed') {
            extractRar(fileName, targetFolder);
        }

        //gz
        if (mime === 'application/gzip') {
            extractGzip(fileName, targetFolder);
        }

    }
}

/*
* Uncompress gz files in a folder 
*
*@param string folderName
*/
const uncompressFolder = (folderName) => {

    /**
    *Create backup folder for originals
    */
    log.info(`[parse_cm_job] Create folder for original version of modified files(originals)...`);

    const originalsBackup = path.join(folderName, 'originals');
    if (!fs.existsSync(originalsBackup)) {
        fs.mkdirSync(originalsBackup)
    }

    let files = fs.readdirSync(folderName, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);
    for (let i = 0; i < files.length; i++) {
        let filePath = path.join(folderName, files[i]);
        let fType = getFileType(filePath);

        if (typeof fType === 'undefined') {
            continue;
        }

        try {
            if (fType.mime === 'application/gzip' ||
                fType.mime === 'application/zip' ||
                fType.mime === 'application/x-rar-compressed' ||
                fType.mime === 'application/x-tar' ||
                fType.mime === 'application/x-bzip2' ||
                fType.mime === 'application/x-lzip' ||
                fType.mime === 'application/x-lzma' ||
                fType.mime === 'application/x-7z-compressed' ||
                fType.mime === 'application/x-gtar'
            ) {
                log.info(`Uncompressing ${files[i]}...`);

                unCompressFile(filePath, folderName);

                //Move
                let newPath = path.join(originalsBackup, files[i]);
                fs.renameSync(filePath, newPath)

            } else {
                log.info(`[parse_cm_job] Skip uncompressing of ${filePath}`);
            }
        } catch (e) {
            log.error(`[parse_cm_job] file:${filePath} fType:${fType.toString()} error:${e.toString()}`);
        }
    }
}

/**
* Clean Huawei GExport files.
*
*	sed -i -r "
*	s/_(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)//ig;
*	s/_(BTS3900|PICOBTS3900|BTS3911B|PICOBTS3911B|MICROBTS3900|MICROBTS3911B)//ig;
*	s/BSC(6910|6900)(UMTS|GSM)Function/FUNCTION/ig;
*	s/BSC(6910|6900)Equipment/EQUIPMENT/ig;
*	s/<class name=\"(.*)\"/<class name=\"\U\1\"/ig;
*	s/<class name=\"(.*)_MSCSERVER/<class name=\"\1/ig;
*	s/<class name=\"(.*)_ENODEB\"/<class name=\"\1\"/ig;
*   s/<class name=\"ENODEB([^\"]+)/<class name=\"\U\1/ig;
*	s/<class name=\"(.*)3900/<class name=\"\1/ig;
*	" /mediation/data/cm/huawei/raw/gexport/*.xml
*
* @exportFolder String Folder with the GExport dump XML files to be cleaned
*/
const cleanHuaweiGexportFiles = async (exportFolder) => {
    const replaceOptions = {
        files: path.join(exportFolder, '*'),
        from: [
            /\"(CELLALGOSWITCH|GTPU|CNOPERATOR|USERPRIORITY)_BSC(6900|6910)(U|GU|UMTS)\"/ig,
            /_(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)/ig,
            /_(BTS3900|PICOBTS3900|BTS3911B|PICOBTS3911B|MICROBTS3900|MICROBTS3911B|BTS5900)/ig,
            /BSC(6910|6900)(UMTS|GSM)Function/ig,
            /BSC(6910|6900)Equipment/ig,
            /<class name=\"(.*)\"/ig,
            /<class name=\"(.*)_MSCSERVER/ig,
            /<class name=\"(.*)_ENODEB\"/ig,
            /<class name=\"ENODEB([^\"]+)\"/,
            /<class name=\"(.*)3900/
        ],
        to: [
            (matchStr) => "\"U" + matchStr.match(/<class name=\"(.*)\"/)[1].toUpperCase() + "\"",
            "",
            "",
            "FUNCTION",
            "EQUIPMENT",
            (matchStr) => "<class name=\"" + matchStr.match(/\"(CELLALGOSWITCH|GTPU|CNOPERATOR|USERPRIORITY)_BSC(6900|6910)(U|GU|UMTS)\"/)[1].toUpperCase() + "\"",
            (matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)_MSCSERVER/)[1],
            (matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)_ENODEB\"/)[1] + "\"",
            (matchStr) => "<class name=\"" + matchStr.match(/<class name=\"ENODEB([^\"]+)\"/)[1] + "\"",
            (matchStr) => "<class name=\"" + matchStr.match(/<class name=\"(.*)3900/)[1]
        ],
    };

    return await replace.sync(replaceOptions)

}

/**
* Clean Huawei GExport files.
*
*	sed -i -r "
*	s/<MO className="(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)(.*)/<MO className="\1/ig;
*	" /mediation/data/cm/huawei/raw/motree/*.xml
*
* @exportFolder String Folder with the MO Tree dump XML files to be cleaned
*/
const cleanHuaweiMOTreeFiles = async (exportFolder) => {
    const replaceOptions = {
        files: path.join(exportFolder, '*'),
        from: [
            /<MO className="(BSC6900GSM|BSC6900UMTS|BSC6900GU|BSC6910GSM|BSC6910UMTS|BSC6910GU)/g
        ],
        to: [
            "<MO className=\""
        ],
    };

    return await replace.sync(replaceOptions)
}

/*Use gnu sed.exe on windows
* 
*/
const cleanHuaweiGExportWithSed = (inputFolder) => {
    let libPath = app.getAppPath();

    if (!isDev) {
        libPath = process.resourcesPath;
    }

    let files = fs.readdirSync(inputFolder, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

    const sedScript = path.join(libPath, 'libraries', 'gexport_cleanup.sed');
    const sed = process.platform === "win32" ? path.join(libPath, 'libraries', 'sed.exe') : "sed";

    for (let i = 0; i < files.length; i++) {
        f = files[i];
        inputFile = path.join(inputFolder, f);

        log.info(`Cleaning ${f}...`);

        const child = spawnSync(sed, ['-i', '-r', '-f', sedScript, inputFile]);
        log.info(`${sed} -i -r -f ${sedScript} ${inputFile}`);

        if (child.error) {
            log.info(`[parse_cm_job] error:${child.error.toString()}`);
            //ipcRenderer.send('parse-cm-job', JSON.stringify({status:"error", message: child.stderr.toString()}));
            throw child.error.toString();
        }
    }

}


/*
* Clean Huawei MO Tree XML files.
* @param string inputFolder
*/
const cleanHuaweiMOTreeWithSed = (inputFolder) => {
    let libPath = app.getAppPath();

    if (!isDev) {
        libPath = process.resourcesPath;
    }

    let files = fs.readdirSync(inputFolder, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

    const sedScript = path.join(libPath, 'libraries', 'motree_cleanup.sed');
    const sed = process.platform === 'win32' ? path.join(libPath, 'libraries', 'sed.exe') : 'sed';

    for (let i = 0; i < files.length; i++) {
        f = files[i];
        inputFile = path.join(inputFolder, f);

        log.info(`Cleaning ${f}...`);

        const child = spawnSync(sed, ['-i', '-r', '-f', sedScript, inputFile]);
        log.info(`${sed} -i -r -f ${sedScript} ${inputFile}`);

        if (child.error) {
            log.info(`[parse_cm_job] error:${child.error.toString()}`);
            throw child.error.toString();
        }
    }

}

/*
* Take the latest file when there is more than one file from the same node .
*
8 @param pathToFolder The name of the folder containing the GExport XML CM dumps
*/
removeDublicateHuaweiGExportFiles = (pathToFolder) => {

    //Create temp folder
    const repeatedFilesFolder = path.join(pathToFolder, 'repeated_files');

    log.info(`Creating folder for duplicate files: ${repeatedFilesFolder} ... `)

    if (!fs.existsSync(repeatedFilesFolder)) {
        fs.mkdirSync(repeatedFilesFolder)
    }

    log.info("Starting removal of duplicate gexport files...")
    //Key - value pair of node and the most recent file
    let nodeAndRecentFile = {};

    //items = fs.readdirSync(pathToFolder);
    items = fs.readdirSync(pathToFolder, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

    for (let i = 0; i < items.length; i++) {
        let gexportFilename = items[i];
        let matches = gexportFilename.match(/(.*)_(\d+)\.xml.*/)

        log.info(`Checking whether ${gexportFilename} is a duplicate... `)

        if (matches === null) continue;

        let node = matches[1];
        let timestamp = matches[2];

        if (typeof nodeAndRecentFile[node] === 'undefined') {

            nodeAndRecentFile[node] = gexportFilename;
        } else {
            //Get timestamp on file in nodeAndRecentFile
            const mostRecentTimestamp = nodeAndRecentFile[node].match(/(.*)_(\d+)\.xml.*/)[2];

            if (parseInt(timestamp) > parseInt(mostRecentTimestamp)) {
                let oldPath = path.join(pathToFolder, nodeAndRecentFile[node])
                let newPath = path.join(repeatedFilesFolder, nodeAndRecentFile[node])
                fs.renameSync(oldPath, newPath)

                nodeAndRecentFile[node] = gexportFilename;
            }

        }
    }

    nodeAndRecentFile = {};
    log.info(`Duplicate file removal completed.`)

}

const processCMDumps = async (vendor, format, inputFolder, outputFolder) => {

    let basepath = app.getAppPath();

    if (!isDev) {
        basepath = process.resourcesPath
    }

    const parser = VENDOR_CM_PARSERS[vendor][format]
    const parserPath = path.join(basepath, 'libraries', parser)


    //Clean Huawei GExport files 
    if (vendor === 'HUAWEI' && format === 'GEXPORT_XML') {
        try {
            removeDublicateHuaweiGExportFiles(inputFolder)

            log.info(`Uncompressing files GExport XML files...`)

            uncompressFolder(inputFolder);

            log.info(`Uncompressing files GExport XML files...`)

            if (process.platform === "win32") {
                //If windows test, with sed.exe 
                cleanHuaweiGExportWithSed(inputFolder);
            } else {
                //use sed if it is installed
                await cleanHuaweiGexportFiles(inputFolder);
            }

            log.info(`Cleanup of GExport XML files completed.`);

        } catch (error) {
            log.error('Error occurred:', error);
            if (typeof error === 'undefined') {
                return;
            }
            return;
        }

    }

    //Clean Huawei MOTree files 
    else if (vendor === 'HUAWEI' && format === 'MOTREE_XML') {
        try {

            log.info(`Uncompressing files MOTree XML files...`);

            uncompressFolder(inputFolder);

            log.info(`Uncompressing files MOTree XML files...`)

            if (process.platform === "win32") {
                //If windows test, with sed.exe 
                cleanHuaweiMOTreeWithSed(inputFolder);
            } else {
                await cleanHuaweiMOTreeFiles(inputFolder);
            }

            log.info(`Cleanup of MOTree XML files completed.`);

        } catch (error) {
            log.error('Error occurred:', error);
            if (typeof error === 'undefined') {
                return;
            }
            return;
        }

    }


    //Uncompress files for other vendor format combinations except huawei gexport 
    //The reason for this is we want to first remove the duplicates in the dumps, before wasting time 
    //uncompressing what does not need to be uncompressed 
    //else if(vendor !== 'HUAWEI' && (format !== 'GEXPORT_XML' || format !== 'MOTREE_XML')){
    else {
        log.info("Uncompressing files...")
        uncompressFolder(inputFolder);
    }

    log.info("Parsing files...")



    let commandArgs = ['-jar', parserPath, '-i', inputFolder, '-o', outputFolder];

    if (vendor.toLowerCase() === 'ericsson' && format === 'BSM') commandArgs[5] = path.join(outputFolder, "inv_bsm.csv")

    //Set the java heap to 1G if processing ZTE Plan template excel workbook
    if (vendor.toLowerCase() === 'zte' && format === 'XLS') commandArgs.unshift('-Xms1G');

    const child = spawn('java', commandArgs);
    log.info(`java ${commandArgs.join(" ")}`);

    child.stdout.on('data', (data) => {
        log.info(data.toString());
    });

    child.stderr.on('data', (data) => {
        log.error(`${data.toString()}`)
    });

    child.on('exit', code => {
        if (code === 0) {
            log.info(`Dump successfully parsed. Find csv files in ${outputFolder}`);
        } else {
            log.error(`Something went wrong`);
        }
    });

}

/*
* Load CM Data into mongodb
* 
* @param string vendor 
* @param string format
* @param string csvFolder
*/
async function loadCMData(vendor, format, csvFolder) {
    log.info(`vendor:${vendor} format:${format}, ${csvFolder}`);
    items = fs.readdirSync(csvFolder, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name);

    log.info(`Loading ${vendor} ${format} files from ${csvFolder}`);

    for (let i = 0; i < items.length; i++) {
        let fileName = items[i];
        let filePath = path.join(csvFolder, items[i]);
        let moName = items[i].replace(/.csv$/i, '');
        let table = `${vendor.toLowerCase()}_cm."${moName}"`;
        let table2 = `${vendor}_cm_\\"${moName}\\"`;

        //@TODO: pick database settings from sqlite db
        const child = spawn('psql', ['-U', 'bodastage', '-h', 'localhost', '-p', '5432', '-d', 'boda', '-c', `"COPY ${table2} (data) FROM STDIN;"`], {
            env: { 'PGPASSWORD': 'password' },
            shell: true
        });

        child.stderr.on('data', (data) => {
            log.error(data)
        });

        child.stdin.on('data', (data) => {
            //console.log(`child.stdin.on.data: ${data}`);
        });


        await new Promise((resolve, reject) => {
            csv()
                .fromFile(filePath)
                .subscribe((json) => {
                    const jsonString = JSON.stringify(json);
                    //console.log(`json:`, json);
                    //log.log(`json:`, json);
                    //log.log(`jsonString:`, jsonString);

                    child.stdin.write(jsonString + '\n');

                    log.info(`echo ${jsonString} | psql -U bodastage -h localhost -p 5432 -d boda -c "COPY ${table2} (data) FROM STDIN;"`);

                    if (child.error) {
                        throw child.error.toString();
                    } else {
                        log.info(child.stdout.toString());
                    }
                }, (err) => {//onError
                    console.error(err);
                    child.stdin.end();
                    reject();
                },
                    () => {//onComplete
                        child.stdin.end();
                        resolve(undefined);
                        //console.log(`csv.fromStream.subscribe.end`);
                        //end cild spawn
                    });

        });




    }
    log.info('load_cm_data', 'success', `Completed loading data.`);

}

/*
* Unzip file into targetFolder
*
* @param string fileName Name of file to unzip 
* @param string targetFolder Name of destination folder
*/
const extractZip = (fileName, targetFolder) => {
    fs.createReadStream(fileName).pipe(unzip.Extract({ path: targetFolder }));
}

/*
* Extract tar file into targetFolder
*
* @param string fileName Name of file to extract 
* @param string targetFolder Name of destination folder
*/
const extractTar = (fileName, targetFolder) => {
    tar.x(  // or tar.extract(
        {
            file: fileName,
            cwd: targetFolder,
            sync: true
        }
    );
}

/*
* Extract rar file into targetFolder
*
* @param string fileName Name of file to extract 
* @param string targetFolder Name of destination folder
*/
const extractRar = (fileName, targetFolder) => {
    try {
        var extractor = unrar.createExtractorFromFile(fileName, targetFolder);
        extractor.extractAll();
    } catch (e) {
        log.error(e);
    }
}

/*
* Extract gz file into targetFolder
*
* @param string fileName Name of file to extract 
* @param string targetFolder Name of destination folder
*/
const extractGzip = (fileName, targetFolder) => {

    const targetFile = path.join(targetFolder, path.basename(fileName).replace(".gz", ""));
    gunzip(fileName, targetFile);

}


module.exports = {
    getFileType,
    winGunzipFile,
    unCompressFile,
    uncompressFolder,
    cleanHuaweiGexportFiles,
    cleanHuaweiMOTreeFiles,
    cleanHuaweiGExportWithSed,
    processCMDumps,
    loadCMData,
    extractZip,
    extractTar,
    extractRar,
    extractGzip
};