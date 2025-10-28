import * as path from 'path';
import * as fs from 'fs';

import { AbsoluteUrlMapper } from './mapper';
import { ImageCache } from '../util/imagecache';
import { tryFindFileWithExtension } from '../util/fileutil';
import { acceptedExtensions } from '../util/acceptedExtensions';

export const relativeToOpenFileUrlMapper: AbsoluteUrlMapper = {
    map(fileName: string, imagePath: string, additionalMetadata?: { relativeImageDir?: string; enableAutoExtensionName?: boolean }) {
        let absoluteImagePath: string;
        const pathName = path.normalize(imagePath);
        if (pathName) {
            let testImagePath = path.join(fileName, '..', additionalMetadata?.relativeImageDir || '', pathName);
            if (ImageCache.has(testImagePath) || fs.existsSync(testImagePath)) {
                absoluteImagePath = testImagePath;
            } else if (additionalMetadata?.enableAutoExtensionName) {
                // 如果文件不存在且启用了自动扩展名，尝试添加扩展名
                const pathWithExtension = tryFindFileWithExtension(testImagePath, acceptedExtensions);
                if (pathWithExtension) {
                    absoluteImagePath = pathWithExtension;
                }
            }
        }
        return absoluteImagePath;
    },
    refreshConfig() {},
};
