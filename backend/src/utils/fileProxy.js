const fs = require('node:fs');
const path = require('node:path');

const uploadsRoot = path.resolve(__dirname, '../../uploads');

const CONTENT_TYPE_BY_EXTENSION = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.md': 'text/markdown; charset=utf-8',
    '.markdown': 'text/markdown; charset=utf-8',
    '.pdf': 'application/pdf',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain; charset=utf-8',
};

function isPathInside(root, target) {
    const relative = path.relative(root, target);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function normalizeUploadPath(storedPath) {
    if (!storedPath || /^https?:\/\//i.test(storedPath)) {
        return null;
    }

    const normalized = storedPath.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads/')) {
        return normalized.slice('/uploads/'.length);
    }

    if (normalized.startsWith('uploads/')) {
        return normalized.slice('uploads/'.length);
    }

    return normalized.replace(/^\/+/, '');
}

function resolveUploadPath(storedPath, { root = uploadsRoot, requiredPrefix = null } = {}) {
    const relativePath = normalizeUploadPath(storedPath);
    if (!relativePath) {
        return null;
    }

    if (requiredPrefix) {
        const normalizedPrefix = requiredPrefix.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
        if (relativePath !== normalizedPrefix && !relativePath.startsWith(`${normalizedPrefix}/`)) {
            return null;
        }
    }

    const resolvedRoot = path.resolve(root);
    const resolvedPath = path.resolve(uploadsRoot, relativePath);

    if (!isPathInside(resolvedRoot, resolvedPath)) {
        return null;
    }

    return resolvedPath;
}

function getContentType(filePath, storedMimeType = null) {
    return storedMimeType || CONTENT_TYPE_BY_EXTENSION[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function streamLocalFile(res, filePath, { contentType, downloadName } = {}) {
    const stats = await fs.promises.stat(filePath);
    if (!stats.isFile()) {
        return false;
    }

    res.setHeader('Content-Type', contentType || getContentType(filePath));
    res.setHeader('Content-Length', stats.size);

    if (downloadName) {
        const safeName = path.basename(downloadName).replace(/["\\]/g, '');
        res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    }

    fs.createReadStream(filePath).pipe(res);
    return true;
}

module.exports = {
    getContentType,
    resolveUploadPath,
    streamLocalFile,
    uploadsRoot,
};
