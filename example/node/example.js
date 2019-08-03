const process = require('process');

const version = require('./../../lib/index').version;

const Connection = require('./../../lib/connection/websocket/Connection'),
	SubscriptionType = require('./../../lib/connection/SubscriptionType'),
	WebSocketAdapterFactoryForNode = require('./../../lib/connection/websocket/adapter/WebSocketAdapterFactoryForNode');

const CustomLoggingProvider = require('./logging/CustomLoggingProvider');

const LoggerFactory = require('./../../lib/logging/LoggerFactory');

const startup = (() => {
	'use strict';
	
	//LoggerFactory.configureForConsole();
	//LoggerFactory.configureForSilence();

	LoggerFactory.configure(new CustomLoggingProvider());

	const __logger = LoggerFactory.getLogger('@barchart/example');

	__logger.log(`Example: Node.js example script started [ version ${version} ]`);

	let connection = null;
	let adapterFactory = null;

	process.on('SIGINT', () => {
		__logger.log('\nExample: Processing SIGINT');

		if (connection !== null) {
			connection.disconnect();
		}

		__logger.log('Example: Node.js example script ending');

		process.exit();
	});

	const host = process.argv[2];
	const username = process.argv[3];
	const password = process.argv[4];
	const symbols = process.argv[5];

	__logger.log(`Example: Instantiating Connection (using Node.js adapter) for [ ${username}/${password} ] @ [ ${host} ]`);

	connection = new Connection();
	adapterFactory = new WebSocketAdapterFactoryForNode();

	connection.connect(host, username, password, adapterFactory);

	if (typeof symbols === 'string') {
		symbols.split(',').forEach((s) => {
			let price = null;

			const handleMarketUpdate = function(message) {
				const current = connection.getMarketState().getQuote(s).lastPrice;

				if (price !== current) {
					price = current;

					__logger.log(`Example: ${s} = ${price}`);
				}
			};

			connection.on(SubscriptionType.MarketUpdate, handleMarketUpdate, s);
		});
	}
})();