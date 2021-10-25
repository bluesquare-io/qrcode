#!/usr/bin/env node
const {promises:fs} = require('fs')
const csv = require('csvtojson')
const path = require('path')
const { program } = require('commander')
const QRCode = require('qrcode')
let jimp = require('jimp')
let QR_CODE_SIZE = 300
const getConstants= async function(options){
  const QrFONT = options[0].label ? await jimp.loadFont(jimp.FONT_SANS_16_BLACK) : null
  const chemin_qr = path.join(options[1], `${options[2]}` + '.png')
  await QRCode.toFile(chemin_qr, `${options[0].prefix ? `${options[0].prefix}` : ''}${options[2]}`, {width:QR_CODE_SIZE})
  return [QrFONT, chemin_qr, QRCode];}



program
    .version('1.0.0').description(
'generate unique QR codes from a csv file'
    )
    /*csvPath is required by commander*/
    .arguments('<csvPath>')
  .action(async (f, options) => {
const ids=new Array()
        try {
          // Get ids CSV
          f = path.join(process.cwd(), f)
            f = await csv({noheader:!!1}).fromFile(f)
              f = f.map(jsonId=>jsonId.field1.replace(';',''))

          //Create new output folder
          let erreursQR=[], output_path = path.join(__dirname, options.dest)
          await fs.mkdir(output_path, { recursive: true })
      await Promise.all(
          f.map(async (id_Qr) => {
            const id = id_Qr
          try {
            // Charge police pour les libellés
            const CONSTANTS= await getConstants([options, output_path,id_Qr])
            const QrFONT = CONSTANTS[0]
            const chemin_qr = CONSTANTS[1]
            // Ending if label unneed
            if(!options.label){
              return false
            }else {
              const image = await jimp.read(chemin_qr)
              const d=2
              // Adding label on image
              image.print(options.label ? await jimp.loadFont(jimp.FONT_SANS_16_BLACK) : null,
                QR_CODE_SIZE/d - jimp.measureText(options.label ?
                  await jimp.loadFont(jimp.FONT_SANS_16_BLACK) : null, id_Qr)/d,
                QR_CODE_SIZE-jimp.measureTextHeight(options.label ? await jimp.loadFont(jimp.FONT_SANS_16_BLACK) : null, id_Qr) - 8, id_Qr)
              return image
                .writeAsync(chemin_qr)
            }
          }catch(erreur){
            // don't stop others
            erreursQR.push(id)
            console.error('QR Code failed', id, erreur)
            return
          }
            ids.push(id)
        }),
      )
        // Exit process sucessfuly
          const s = Math.round(ids.length-erreursQR.length)
        console.log(`✓QR codes generated, ${s} succeeded,${erreursQR.length} failed`);process.exit(0)
      }catch (err) {
        console.error('QR Code generation failed', err);


        process.exit(1)
      }
    })
  // --dest is required by commander
  program.requiredOption('-d, --dest <qrCodeDest>',
    'path where all the generated QR codes will be stored')
    .option('-p, --prefix <qrCodePrefix>',
      'prefix that will be added to each id')
    .option('-l, --label', 'Whether to add label or not to each QR code')
    .parse(process.argv)
