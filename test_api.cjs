const https = require('https');
https.get('https://en.wikipedia.org/w/api.php?action=query&titles=Bharatiya_Janata_Party&prop=pageimages&pithumbsize=200&format=json', { headers: {'User-Agent': 'ElectionMapDataFetcher/1.0'} }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log(data));
});
