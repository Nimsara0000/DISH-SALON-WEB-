import dbConnect from '../../lib/mongodb';
import Post from '../../models/Post';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const { id, password } = req.query;

  switch (method) {
    case 'GET':
      const posts = await Post.find({}).sort({ createdAt: -1 });
      return res.status(200).json(posts);

    case 'POST':
      if (req.body.password !== "NIMSARA2009") return res.status(401).json({ msg: "Unauthorized" });
      const newPost = await Post.create(req.body);
      return res.status(201).json(newPost);

    case 'PUT':
      if (req.body.password !== "NIMSARA2009") return res.status(401).json({ msg: "Unauthorized" });
      const updatedPost = await Post.findByIdAndUpdate(req.body.id, { caption: req.body.caption }, { new: true });
      return res.status(200).json(updatedPost);

    case 'DELETE':
      if (password !== "NIMSARA2009") return res.status(401).json({ msg: "Unauthorized" });
      await Post.findByIdAndDelete(id);
      return res.status(200).json({ msg: "Deleted" });

    default:
      res.status(405).end();
  }
}
