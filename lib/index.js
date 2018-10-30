const fb = require('fb-video-downloader');
const download = require('download-file');
const Promise = require('bluebird');
const fs = require('fs');
const cheerio = require('cheerio');

const readFile = Promise.promisify(fs.readFile);

const parseFile = (file, fbVideoUrl) => {
    const pagename = fbVideoUrl.split('/').filter(e => e.length > 0)[3];
    const regex = new RegExp(`https:\/\/www.facebook.com\/${pagename}\/videos\/.*\/`, 'gm')
    const page = file.toString();
    const c = cheerio.load(page);

    return Array.from(c('a').get()).map(e => e.attribs.href).filter(e => regex.test(e));
};

const processVideoResponse = response => {
    const {hd, sd} = response.download;
    const {title} = response;

    return {
        url: {
            hd,
            sd
        },
        title
    }

};

const downloadOne = (info, destinationFolder) => {
    const downloadProps = {
        filename: `${info.title}.mp4`,
        directory: destinationFolder
    };
    const {hd, sd} = info.url;
    return new Promise((resolve, reject) => {
        download(hd || sd, downloadProps, err => {
            if (err) return reject(err);
            console.log(`${info.title}.mp4 downloaded.`);
            return resolve(`${info.title}.mp4 downloaded.`)
        })
    });
};

const getVidoesListFromFile = (filePath, fbVideoUrl) => {
    console.log('Step 1/4 - Getting page information...');
    return readFile(filePath).then(file => parseFile(file, fbVideoUrl));
};

const getInfoAll = videos => {
    console.log('Step 2/4 - Collecting metadata...');
    return Promise.mapSeries(videos, (video, i) => {
        console.log(`Getting metadata (${i + 1} of ${videos.length}).`);
        return fb.getInfo(video);
    });
};

const proccessAllVideos = videos => {
    console.log('Step 3/4- Processing collected metadata...');
    return Promise.map(videos, processVideoResponse);
};

const downloadAll = (videos, destinationFolder) => {
    console.log('Step 4/4 - Downloading facebook videos...');
    return Promise.mapSeries(videos, (video, i) => {
        console.log(`Downloading... (${i + 1} of ${videos.length}).`);
        return downloadOne(video, destinationFolder) ;
    });
};

const downloadVideos = (filePath, fbVideoUrl, destinationFolder) => {
    console.log(`*** Download videos from ${fbVideoUrl} started! ***`);
    console.log(`*** Do not close the application while download is in process.`);
    console.log(`*** It may take a long time depending on the number of videos.`);
    console.log(`\n`);
    return Promise.resolve(filePath)
        .then(filePath => getVidoesListFromFile(filePath, fbVideoUrl))
        .then(getInfoAll)
        .then(proccessAllVideos)
        .then((videos) => downloadAll(videos, destinationFolder))
        .then(() => console.log(`All videos from ${fbVideoUrl} was downloaded!`))
        .catch(err => console.log(err))
};

module.exports = (options) => {
    const {filePath,fbVideoUrl, destinationFolder} = options;
    try {
        return downloadVideos(filePath, fbVideoUrl, destinationFolder);
    } catch (err) {
        console.log(`Could not download videos from ${fbVideoUrl}`);
        console.log(err);
    }
};