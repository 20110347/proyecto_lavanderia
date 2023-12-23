import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';

console.log(process.env.INTERFACE)

let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'printer:EPSON_TM-T20II',
    characterSet: CharacterSet.PC852_LATIN2,
    removeSpecialCharacters: false,
    lineCharacter: "=",
    breakLine: BreakLine.WORD, 
    driver: ''
});

export const generateTicket = async () => {

    console.log('starting')
    console.log(printer)
    let isConnected = await printer.isPrinterConnected();       // Check if printer is connected, return bool of status
    // let execute = await printer.execute();                      // Executes all the commands. Returns success or throws error
    // let raw = await printer.raw(Buffer.from("Hello world"));    // Print instantly. Returns success or throws error
    console.log(isConnected)
    if (isConnected) {
        printer.print("Hello World");                               // Append text
        printer.println("Hello World");                             // Append text with new line
        printer.openCashDrawer();                                   // Kick the cash drawer
        printer.cut();                                              // Cuts the paper (if printer only supports one mode use this)
        printer.partialCut();                                       // Cuts the paper leaving a small bridge in middle (if printer supports multiple cut modes)
        printer.beep();                                             // Sound internal beeper/buzzer (if available)
        printer.upsideDown(true);                                   // Content is printed upside down (rotated 180 degrees)
        printer.setCharacterSet(CharacterSet.PC852_LATIN2);         // Set character set - default set on init

        printer.bold(true);                                         // Set text bold
        printer.invert(true);                                       // Background/text color inversion
        printer.underline(true);                                    // Underline text (1 dot thickness)
        printer.underlineThick(true);                               // Underline text with thick line (2 dot thickness)
        printer.drawLine();                                         // Draws a line
        printer.newLine();                                          // Inserts break line

        printer.alignCenter();                                      // Align text to center
        printer.alignLeft();                                        // Align text to left
        printer.alignRight();                                       // Align text to right

        printer.setTypeFontA();                                     // Set font type to A (default)
        printer.setTypeFontB();                                     // Set font type to B

        printer.setTextNormal();                                    // Set text to normal
        printer.setTextDoubleHeight();                              // Set text to double height
        printer.setTextDoubleWidth();                               // Set text to double width
        printer.setTextQuadArea();                                  // Set text to quad area
        printer.setTextSize(7, 7);                                   // Set text height (0-7) and width (0-7)

        printer.leftRight("Left", "Right");                         // Prints text left and right
        printer.table(["One", "Two", "Three"]);                     // Prints table equally
        printer.tableCustom([                                       // Prints table with custom settings (text, align, width, cols, bold)
            { text: "Left", align: "LEFT", width: 0.5 },
            { text: "Center", align: "CENTER", width: 0.25, bold: true },
            { text: "Right", align: "RIGHT", cols: 8 }
        ]);

        printer.code128("Code128");                                 // Print code128 bar code
        printer.printQR("QR CODE");                                 // Print QR code
        await printer.printImage('./assets/olaii-logo-black.png');  // Print PNG image

        printer.clear();                                              // Clears printText value
        printer.getText();                                            // Returns printer buffer string value
        printer.getBuffer();                                          // Returns printer buffer
        printer.setBuffer(newBuffer);                                 // Set the printer buffer to a copy of newBuffer
        printer.getWidth();
    }
    printer.print("Hello World");

    printer.execute(function(err){
        if(err){
            console.error('Something Happens', err)
        }else{
            console.log('Work Done')
        }
    })
}