import { Upload, Button, message } from "antd";
import { uploadTexture } from "../api/modelsApi";

export default function TextureUploader({ modelId, onUploaded }) {
  const handleUpload = async ({ file }) => {
    try {
      const result = await uploadTexture(modelId, file);
      message.success("Upload texture thành công!");
      onUploaded(result.textureUrl);
    } catch {
      message.error("Lỗi khi upload texture!");
    }
  };

  return (
    <Upload customRequest={handleUpload} showUploadList={false}>
      <Button>Thay texture</Button>
    </Upload>
  );
}
