# twitter-media

Simple module for uploading media to Twitter. It can handle images, videos and image sets and returns media_ids, which can be posted with Twitter statuses.

## API

### TwitterMedia(oauthOptions)

#### oauthOptions: Object
An object containing Twitter API credentials

	{
		consumer_key: '...',
		consumer_secret: '...',
		token: '...',
		token_secret: '...'
	}

### TwitterMedia#uploadMedia(type, media, callback)

#### type: String
Possible values are: "image", "video"

#### media: Buffer
Node.js buffer containing uploaded media


### TwitterMedia#uploadImageSet(images, callback)

#### images: [Buffer]
Images argument is array of buffers containing uploaded images. Twitter allows up to 4 images at one tweet.

## License
The MIT License (MIT)

Copyright (c) 2017 Jan Žaloudek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
