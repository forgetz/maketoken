import fs from "fs-extra"
import path from "path";
import solc from "solc";

const _ROOT_PATH = process.env.NODE_ENV !== "development" 
   ? path.resolve(__dirname)
   : path.resolve(process.cwd(), "public")


function compilingPreperations() {
   const buildPath = path.resolve(_ROOT_PATH, 'build');
   fs.removeSync(buildPath);
   return buildPath;
}

function createConfiguration() {
   return {
      language: 'Solidity',
      sources: {
         'ABC.sol': {
            content: fs.readFileSync(path.resolve(_ROOT_PATH, 'ABC.sol'), 'utf8')
         },
      },
      settings: {
         outputSelection: {
            '*': {
               '*': ['*']
            }
         }
      }
   };
}

function getImports(dependency) {
   console.log('Searching for dependency: ', dependency);
   switch (dependency) {
      // case 'IERC.sol':
      //     return {contents: fs.readFileSync(path.resolve(_ROOT_PATH, 'contracts', 'IERC.sol'), 'utf8')};
      default:
          return {error: 'File not found'}
   }
}

function compileSources(config) {
   try {
      console.log('solc version', solc.version())
      console.log("----------------------")
      console.log(config)
      // return JSON.parse(solc.compile(JSON.stringify(config), getImports));
      return JSON.parse(solc.compile(JSON.stringify(config)));
   } catch (e) {
      console.log(e);
   }
}

function errorHandling(compiledSources) {
   if (!compiledSources) {
      console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n', 'NO OUTPUT');
   } else if (compiledSources.errors) { // something went wrong.
      console.error('>>>>>>>>>>>>>>>>>>>>>>>> ERRORS <<<<<<<<<<<<<<<<<<<<<<<<\n');
      compiledSources.errors.map(error => console.log(error.formattedMessage));
   }
}

function writeOutput(compiled, buildPath) {
   fs.ensureDirSync(buildPath);

   for (let contractFileName in compiled.contracts) {
      const contractName = contractFileName.replace('.sol', '');
      console.log('Writing: ', contractName + '.json');
      let output = {
         abi: compiled.contracts[contractFileName][contractName].abi,
         bytecode: compiled.contracts[contractFileName][contractName].evm.bytecode.object
      }
      // fs.outputJsonSync(
      //    path.resolve(buildPath, contractName + '_abi.json'),
      //    compiled.contracts[contractFileName][contractName].abi
      // );
      fs.outputJsonSync(path.resolve(buildPath, contractName + '.json'), output);

      return output;
   }
}

export default function handler(req, res) {

   console.log('solc req', req.query);
   
   const buildPath = compilingPreperations();
   const config = createConfiguration();
   const compiled = compileSources(config);
   errorHandling(compiled);
   let output = writeOutput(compiled, buildPath);

   const result = {
      abi: output.abi,
      bytecode: output.bytecode
   }
   res.status(200).json(result)
}
