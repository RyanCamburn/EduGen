import videosRouter from './video.js';

const constructorMethod = (app) => {
	app.use('/video', videosRouter);
	app.use('*', (req, res) => {
		res.status(404).json({ error: 'Not found' });
	});
}

export default constructorMethod;