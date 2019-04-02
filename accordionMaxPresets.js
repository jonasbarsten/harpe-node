var presets = {
	1: [
		'hei',
		'på',
		'deg'
	],
	2: [
		'lols',
		'smisk',
		'knisk'
	],
	3: [
		'hest',
		'katt',
		'lulz'
	]
};















function bang(v)
{
	if (presets[v])
		presets[v].map(function (cmd) {
			outlet(0, cmd);
		});	
}

function msg_int(v)
{
	bang(v);
}