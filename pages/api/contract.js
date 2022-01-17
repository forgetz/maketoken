
import path from "path";
import fs from "fs-extra";

const _ROOT_PATH = process.env.NODE_ENV !== "development" ? process.cwd() : path.resolve(process.cwd(), "public")
const _SRC_FILENAME = 'ERC20_SRC.sol'

function tempPreperations() {
   const buildPath = path.resolve(_ROOT_PATH, 'contracts', 'tmp');
   fs.removeSync(buildPath);
   return buildPath;
}

async function writeContract(tmpPath, symbol, name) {
   fs.ensureDirSync(tmpPath);
   const saveFile = path.resolve(tmpPath, 'ERC20_' + Date.now() + '.sol')
   const content = await fs.readFileSync(path.resolve(_ROOT_PATH, 'contracts', _SRC_FILENAME), 'utf-8')
   const modifyContent = replaceContent(content, symbol, name)
   fs.outputFileSync(saveFile, modifyContent)
}

function replaceContent(content, symbol, name) {
   return content.replaceAll('%%TOKEN_SYMBOL%%', symbol).replaceAll('%%TOKEN_NAME%%', name);
}


export default function handler(req, res) {
   const { symbol, name } = req.query;
   const tmpPath = tempPreperations();
   writeContract(tmpPath, symbol, name);
   res.status(200).json({ tmpPath })
}
