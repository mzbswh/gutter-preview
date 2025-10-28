import * as path from 'path';
import * as fs from 'fs';

import { AbsoluteUrlMapper } from './mapper';
import { ImageCache } from '../util/imagecache';
import { tryFindFileWithExtension } from '../util/fileutil';
import { acceptedExtensions } from '../util/acceptedExtensions';

export const simpleUrlMapper: AbsoluteUrlMapper = {
    map(fileName: string, imagePath: string, additionalMetadata?: { relativeImageDir?: string; enableAutoExtensionName?: boolean }) {
        let absoluteImagePath: string;
        if (imagePath.indexOf('http') == 0) {
            absoluteImagePath = imagePath;
        } else if (imagePath.indexOf('//') == 0) {
            absoluteImagePath = 'http:' + imagePath;
        } else if (path.isAbsolute(imagePath)) {
            if (ImageCache.has(imagePath) || fs.existsSync(imagePath)) {
                absoluteImagePath = imagePath;
            } else if (additionalMetadata?.enableAutoExtensionName) {
                // 如果文件不存在且启用了自动扩展名，尝试添加扩展名
                const pathWithExtension = tryFindFileWithExtension(imagePath, acceptedExtensions);
                if (pathWithExtension) {
                    absoluteImagePath = pathWithExtension;
                }
            }
        }
        return absoluteImagePath;
    },
    refreshConfig() {},
};
