const videoId = 'jNQXAC9IVRw'; // "Me at the zoo" or any video with CC
fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`)
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.subtitles, null, 2)))
  .catch(err => console.error(err));
