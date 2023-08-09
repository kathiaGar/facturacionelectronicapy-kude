import { exec } from "child_process";
import fs from "fs";
import findJavaHome from "find-java-home";
import { v4 as uuidv4 } from "uuid";

class KUDEGen {
  /**
   * Genera el archivo KUDE para la Factura Electronica
   * @param xml
   * @returns
   */
  async generateKUDE(xml: string, urlLogo: string, ambiente: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const uniqueId = uuidv4();
        const tmpXMLToSign = `${__dirname}/xml_sign_temp_${uniqueId}.xml`;
        fs.writeFileSync(tmpXMLToSign, xml, { encoding: "utf8" });

        findJavaHome({ allowJre: true }, (err: any, java8Path: any) => {
          if (err) return reject(err);
          if (process.env.java8_home) {
            java8Path = process.env.java8_home;
          }

          const classPath = `${__dirname}/jasperLibs/`;
          const jarFile = `${__dirname}/CreateKude.jar`;
          const jasperPath = `${__dirname}/DE/`;

          const fullCommand = `"${java8Path}" -Dfile.encoding=IBM850 -classpath "${classPath}" -jar "${jarFile}" "${tmpXMLToSign}" "${urlLogo}" "${jasperPath}" "${ambiente}"`;

          exec(
            fullCommand,
            { encoding: "utf-8", maxBuffer: 1024 * 1024 },
            (error: any, stdout: any, stderr: any) => {
              if (error) {
                reject(error);
              }
              if (stderr) {
                reject(stderr);
              }

              try {
                // File removed
                fs.unlinkSync(tmpXMLToSign);
              } catch (err) {
                console.error(err);
              }

              resolve(`${stdout}`);
            }
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new KUDEGen();
