import fs from "fs-extra"
import path from "path";

const _ROOT_PATH = process.env.NODE_ENV !== "development" 
   ? path.resolve(__dirname)
   : path.resolve(process.cwd(), "public")


export default function handler(req, res) {
   res.status(200).json({ 
      path: process.cwd(),
      aaa: path.join(__dirname),
      bbb: path.resolve(__dirname),
      ccc: _ROOT_PATH,
      ddd: fs.readFileSync(path.resolve(__dirname, 'ABC.sol'), 'utf8')
   })
}
