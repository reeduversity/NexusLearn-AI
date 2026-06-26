// @ts-ignore
import { PDFParse } from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';

export class ParserService {
  /**
   * Extracts raw text from supported file types.
   */
  static async parseFile(fileBuffer: Buffer, mimeType?: string): Promise<string> {
    try {
      const activeMimeType = mimeType || this.detectMimeType(fileBuffer);
      switch (activeMimeType) {
        case 'application/pdf':
          return await this.parsePDF(fileBuffer);
        case 'text/plain':
          return fileBuffer.toString('utf-8');
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.parseDocx(fileBuffer);
        default:
          throw new Error(`Unsupported file type: ${activeMimeType}`);
      }
    } catch (error) {
      console.error('File parsing failed:', error);
      throw new Error('Failed to parse file content');
    }
  }

  private static detectMimeType(buffer: Buffer): string {
    if (buffer.length >= 4) {
      const header = buffer.toString('hex', 0, 4).toLowerCase();
      if (header === '25504446') {
        return 'application/pdf';
      }
      if (header === '504b0304') {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    }
    return 'text/plain';
  }

  private static async parsePDF(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  private static async parseDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
