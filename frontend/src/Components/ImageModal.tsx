import { useContext, useRef, useState, type SyntheticEvent } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageModal.css';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import ImageContext from "../Contexts/Image/ImageContext";
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FileInput } from './ui/FileInput';

enum ImageTypeEnum {
    User = 1,
    Network = 2,
    Product = 3
}

interface IImageModalParam {
    show: boolean,
    Image: ImageTypeEnum,
    networkId?: number,
    productId?: number,
    onClose: () => void,
    onSuccess?: (url: string) => void
};

interface UploadResult {
    sucesso: boolean;
    url?: string;
    mensagemErro?: string;
}

const ImageModal = (param: IImageModalParam) => {
    const { t } = useTranslation();
    const isUser = param.Image == ImageTypeEnum.User;

    const [src, setSrc] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [crop, setCrop] = useState<Crop>({
        unit: 'px',
        width: isUser ? 100 : 160,
        height: isUser ? 100 : 90,
        x: 25,
        y: 25
    });
    const [, setCroppedBlob] = useState<Blob | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const imageContext = useContext(ImageContext);

    const readFile = (files: FileList | null) => {
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setSrc(reader.result as string));
            reader.readAsDataURL(files[0]);
            setFileName(files[0].name);
        }
    };

    const onImageLoaded = (e: SyntheticEvent<HTMLImageElement>) => {
        imageRef.current = e.currentTarget;
    };

    const getCroppedImg = async () => {
        if (!imageRef.current || !crop.width || !crop.height) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(
            imageRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    setCroppedBlob(blob);
                    resolve(blob);
                }
            }, 'image/jpeg');
        });
    };

    /** Returns true when the upload succeeded. */
    const uploadImage = async (): Promise<boolean> => {
        const blob = await getCroppedImg();
        if (!blob) return false;

        let ret: UploadResult;
        switch (param.Image) {
            case ImageTypeEnum.User:
                ret = await imageContext.uploadImageUser(blob);
                break;
            case ImageTypeEnum.Network:
                ret = await imageContext.uploadImageNetwork(param.networkId, blob);
                break;
            case ImageTypeEnum.Product:
                ret = await imageContext.uploadImageProduct(param.productId, blob);
                break;
            default:
                return false;
        }

        if (!ret.sucesso) {
            toast.error(t('imageModal.uploadError'), { description: ret.mensagemErro });
            return false;
        }
        if (param.onSuccess) {
            param.onSuccess(ret.url);
        }
        toast.success(t('imageModal.uploadSuccess'));
        return true;
    };

    return (
        <Modal
            open={param.show}
            onOpenChange={(open) => { if (!open) param.onClose(); }}
            size="lg"
            title={t('imageModal.title')}
            description={isUser ? t('imageModal.descriptionUser') : t('imageModal.description')}
            closeLabel={t('shared.close')}
            preventClose={imageContext.loading}
            footer={
                <>
                    <Button variant="outline" onClick={param.onClose} disabled={imageContext.loading}>
                        {t('shared.cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<FontAwesomeIcon icon={faUpload} aria-hidden="true" />}
                        loading={imageContext.loading}
                        loadingText={t('imageModal.uploading')}
                        disabled={!src}
                        onClick={async (e) => {
                            e.preventDefault();
                            const ok = await uploadImage();
                            if (ok) param.onClose();
                        }}
                    >
                        {t('imageModal.upload')}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <FileInput
                    label={t('imageModal.fileLabel')}
                    hint={t('imageModal.fileHint')}
                    prompt={t('imageModal.prompt')}
                    dropPrompt={t('imageModal.dropPrompt')}
                    dragPrompt={t('imageModal.dragPrompt')}
                    accept="image/*"
                    // Covers both the file picker and drag-and-drop.
                    onFilesChange={readFile}
                    selected={fileName ? (
                        <p className="text-sm text-muted-foreground">
                            {t('imageModal.selected', { name: fileName })}
                        </p>
                    ) : undefined}
                />
                {src && (
                    <div className="flex flex-col gap-2">
                        <div className="viralt-cropper">
                            <ReactCrop
                                crop={crop}
                                aspect={isUser ? 1 : undefined}
                                onChange={(newCrop) => setCrop(newCrop)}
                            >
                                <img src={src} alt={t('imageModal.previewAlt')} onLoad={onImageLoaded} />
                            </ReactCrop>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('imageModal.cropHint')}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export { ImageModal, ImageTypeEnum };
