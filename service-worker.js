importScripts('/bower_components/sw-toolbox/sw-toolbox.js');

// Version 3.3.7

toolbox.precache(['/sounds/iloveyou.wav',
				  '/sounds/iwantyou.wav',
				  '/sounds/imissyou.wav',
				  '/sounds/youresobeautiful.wav',
				  '/sounds/youremybaby.wav',
				  '/sounds/youremyangel.wav',
				  '/sounds/cathedral.wav',
				  '/sounds/beach.wav',
				  '/sounds/tunnel.wav',
				  '/sounds/cavern.wav',
				  '/sounds/metro.wav',
				  '/sounds/library.wav'
				  ],
				  ['/icons/tre.png',
				   '/icons/favicons-16x16.png',
				   '/icons/favicons-32x32.png',
				   '/icons/favicon.ico'
				  ],
				  ['/bower_components/sw-toolbox/sw-toolbox.js',
				   '/bower_components/skeleton/css/normalize.css',
				   '/bower_components/skeleton/css/skeleton.css'],
				  ['/index.html',
				   '/404.html'],
				  ['/tremalenkislova.js']);

toolbox.router.default = toolbox.cacheFirst;