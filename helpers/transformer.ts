export const titleText = (text: string) => {
    return text.trim()
        .split(" ")
        .map(txt => txt[0].toUpperCase() + txt.slice(1).toLowerCase())
        .join(" ")
}

export const toLowerCase = (text: string) => text.toLowerCase().trim()

export const toUpperCase = (text: string) => text.toUpperCase().trim()

export const transformMRN = (patientCount: number) => {
    const maxMRNLength = 7
    const maxPatientCount = Math.pow(10, maxMRNLength) - 1

    if (patientCount > maxPatientCount) {
        throw new Error("Maximum patient count exceeded")
    }

    const paddedMRN = String(patientCount).padStart(maxMRNLength, "0")
    return paddedMRN
}

export const getFileExtension = (file: Express.Multer.File | string): string | undefined => {
    let mimetype: string | undefined

    if (typeof file === "object" && file.mimetype) {
        mimetype = file.mimetype
    } else if (typeof file === "string") {
        mimetype = file
    }

    let extension: string | undefined

    switch (mimetype) {
        case 'application/octet-stream':
        case 'application/dicom':
            extension = 'dcm'
            break
        case 'video/mp4':
            extension = 'mp4'
            break
        case 'video/webm':
            extension = 'webm'
            break
        case 'video/avi':
            extension = 'avi'
            break
        case 'image/png':
            extension = 'png'
            break
        case 'image/jpeg':
        case 'image/jpg':
            extension = 'jpg'
            break
        case 'audio/mp3':
            extension = 'mp3'
            break
        case 'audio/wav':
            extension = 'wav'
            break
        case 'audio/aac':
            extension = 'aac'
            break
        case 'audio/ogg':
            extension = 'ogg'
            break
        case 'application/pdf':
            extension = 'pdf'
            break
        case 'application/msword':
            extension = 'doc'
            break
        default:
            console.warn(`Unsupported MIME type: ${mimetype}`)
            break
    }

    return extension
}