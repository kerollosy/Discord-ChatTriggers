const Base64 = Java.type("java.util.Base64")
const ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream")
const ImageIO = Java.type("javax.imageio.ImageIO");
const URL = Java.type("java.net.URL")

/**
 * Converts an image to a Data URI.
 * 
 * @param {string|BufferedImage} img - The image to convert. This can be either a URL string or a BufferedImage object.
 * @param {string} [format] - The format of the image. If not provided, the format will be determined from the image URL.
 * @returns {string} The Data URI of the image.
 * @throws {Error} If an error occurs while reading the image or the image format cannot be determined.
 */
export function convertToDataURI(img, format=null) {
    if(typeof img == "string" && !format) {
        format = getImageFormat(img)
        img = Image.fromUrl(img).image
    }

    const outputStream = new ByteArrayOutputStream();
    ImageIO.write(img, format, outputStream);
    const imageBytes = outputStream.toByteArray();

    const base64Image = Base64.getEncoder().encodeToString(imageBytes);
    const dataURI = "data:image/" + format + ";base64," + base64Image;

    return dataURI;
}

/**
 * Determines the format of an image from its URL.
 * 
 * @param {string} url - The URL of the image.
 * @returns {string|null} The format of the image, or null if the format cannot be determined.
 * @throws {Error} If an error occurs while reading the image.
 */
export function getImageFormat(url) {
    const imageUrl = new URL(url);
    const iis = ImageIO.createImageInputStream(imageUrl.openStream());

    const readers = ImageIO.getImageReaders(iis);
    if (!readers.hasNext()) {
        return null; // No readers found
    }

    const reader = readers.next();
    const formatName = reader.getFormatName();
    iis.close();
    reader.dispose();

    return formatName;
}