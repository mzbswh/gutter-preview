import * as fs from 'fs';
import * as path from 'path';
import { filesize } from 'filesize';
import { ImageCache } from './imagecache';

export function copyFile(source: string, target: string, cb: (err?: any) => void) {
    const fileSizeInBytes = fs.statSync(source).size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    if (fileSizeInMegabytes > 20) {
        done(new Error('Maximum file size of 20MB is exceeded'));
        return;
    }

    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on('error', function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on('error', function (err) {
        done(err);
    });
    wr.on('close', function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err?) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

export function getFilesize(source: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.stat(source, async (err, info) => {
            if (err) {
                return reject(err);
            }

            return resolve(filesize(info.size, { standard: 'jedec' }));
        });
    });
}

export function isLocalFile(source: string): boolean {
    return source.indexOf('://') == -1;
}

export function isUrlEncodedFile(path: string): boolean {
    return path.startsWith('data:image');
}

/**
 * 为没有扩展名的本地文件路径尝试添加扩展名
 * @param basePath 基础路径
 * @param extensions 要尝试的扩展名数组
 * @returns 找到的第一个存在的文件路径，如果都不存在则返回 undefined
 */
export function tryFindFileWithExtension(basePath: string, extensions: string[]): string | undefined {
    // 检查是否为本地文件
    if (!isLocalFile(basePath)) {
        return undefined;
    }

    // 检查路径是否已经有扩展名
    if (path.extname(basePath)) {
        return undefined;
    }

    // 按顺序尝试每个扩展名
    for (const ext of extensions) {
        const testPath = basePath + ext;
        
        // 先检查缓存
        if (ImageCache.has(testPath)) {
            return testPath;
        }
        
        // 再检查文件系统
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }

    return undefined;
}
