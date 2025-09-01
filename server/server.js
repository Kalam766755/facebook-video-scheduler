// MongoDB Connection - Direct string use karein
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kalam764499:kalam764499@cluster0.knagk4o.mongodb.net/facebook_scheduler?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  console.log('Using connection string:', MONGODB_URI);
});
