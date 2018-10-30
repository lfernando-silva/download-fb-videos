# download-fb-videos
Script to download all videos of a facebook page (not user videos)

Steps:
1. Access the Facebook page you want and go to section /videos.

2. Save the page as a complete web page.

3. Copy the URL of the page, e.g. `https://www.facebook.com/pg/{page name}/videos/`

3. Call the lib passing the following params:
* filePath: Path to saved html file
* dbVideoUrl: Url of page
* destinationFolder: Path to download the videos

```js
//Example
const downloadFbVideos = require('./lib');

downloadFbVideos({
    filePath: '/home/user/Downloads/Tom & Jerry Lover - Videos.html',
    fbVideoUrl: 'https://www.facebook.com/pg/tomjerrylovervid/videos/',
    destinationFolder: '/home/user/Videos/tom_jerry',
});
```

Notes:
- Probably don't work for user videos (not tested).
- Download in .mp4 format.
- May take a long time, depending on the number of videos.
- Do not close the application before it ends the metadata collecting, or none downloads are done.
