"""Subject cut-outs with Apple Vision (VNGenerateForegroundInstanceMaskRequest, the model behind "Lift subject" in Photos).
Usage: python -I vision_cutout.py OUT_DIR IMAGE [IMAGE ...]  -> OUT_DIR/<stem>.png (RGBA, cropped to subject)."""
import os
import sys

import Vision
from Foundation import NSURL
from Quartz import CIContext, CIImage, CGColorSpaceCreateWithName, kCGColorSpaceSRGB, kCIFormatRGBA8


def cutout(src, dst):
    image = CIImage.imageWithContentsOfURL_(NSURL.fileURLWithPath_(src))
    if image is None:
        return 'ERR read'
    handler = Vision.VNImageRequestHandler.alloc().initWithCIImage_options_(image, {})
    request = Vision.VNGenerateForegroundInstanceMaskRequest.alloc().init()
    ok, err = handler.performRequests_error_([request], None)
    if not ok:
        return f'ERR perform {err}'
    results = request.results()
    if not results:
        return 'ERR no-subject'
    result = results[0]
    instances = result.allInstances()
    buffer, err = result.generateMaskedImageOfInstances_fromRequestHandler_croppedToInstancesExtent_error_(instances, handler, True, None)
    if buffer is None:
        return f'ERR mask {err}'
    masked = CIImage.imageWithCVPixelBuffer_(buffer)
    context = CIContext.contextWithOptions_(None)
    ok, err = context.writePNGRepresentationOfImage_toURL_format_colorSpace_options_error_(
        masked, NSURL.fileURLWithPath_(dst), kCIFormatRGBA8, CGColorSpaceCreateWithName(kCGColorSpaceSRGB), {}, None)
    if not ok:
        return f'ERR write {err}'
    ext = masked.extent()
    return f'OK {int(ext.size.width)}x{int(ext.size.height)} instances={instances.count()}'


if __name__ == '__main__':
    out_dir = sys.argv[1]
    for src in sys.argv[2:]:
        stem = os.path.splitext(os.path.basename(src))[0]
        print(stem, cutout(src, os.path.join(out_dir, stem + '.png')), flush=True)
