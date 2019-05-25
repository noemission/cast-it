import { readFile as _readFile } from "fs";
import { promisify } from "util";
import franc from "franc";
import charsetDetector from "charset-detector";
import iconv from "iconv-lite";
const readFile = promisify(_readFile)


export const detectFromFile = async(filePath) => {
    
    const content = await readFile(filePath);

    const charset = charsetDetector(content)[0];
    console.log('charset',charset)

    return franc(iconv.decode(content, charset.charsetName));

}