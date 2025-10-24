import { useState } from "react";
import { Input, Button, message, Spin, Progress, Modal, Upload, Radio } from "antd";
import { UploadOutlined, SendOutlined, SaveOutlined, BgColorsOutlined, ReloadOutlined } from "@ant-design/icons";
import { createModel, streamModelStatus, saveModelToDB } from "../../../../api/modelsApi";
import ModelViewer from "./ModelViewer";

export default function ModelCreateForm({ onCreated }) {
  const [mode, setMode] = useState("text"); // "text" | "image"
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState(null);
  const [statusText, setStatusText] = useState("🌀 Chưa có model nào được tạo");
  const [taskId, setTaskId] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setMode("text");
    setName("");
    setPrompt("");
    setImageFile(null);
    setProgress(0);
    setModelUrl(null);
    setStatusText("🌀 Chưa có model nào được tạo");
    setTaskId(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return message.warning("Nhập tên model!");
    if (mode === "text" && !prompt.trim())
      return message.warning("Nhập prompt mô tả model bạn muốn tạo!");
    if (mode === "image" && !imageFile)
      return message.warning("Chọn ảnh để tạo model!");

    setLoading(true);
    setProgress(0);
    setModelUrl(null);
    setStatusText("🚀 Đang khởi tạo task...");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("mode", mode);

      if (mode === "text") {
        formData.append("prompt", prompt);
      } else {
        formData.append("imageFile", imageFile);
      }

      const result = await createModel(formData);
      const newTaskId = result?.taskId;

      if (!newTaskId) {
        message.error("Không nhận được taskId từ server!");
        setLoading(false);
        return;
      }

      setTaskId(newTaskId);
      message.success("Đã gửi yêu cầu tạo model!");
      onCreated?.(result);
      listenToStream(newTaskId);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tạo model!");
      setLoading(false);
    }
  };

  const listenToStream = (taskId) => {
    const eventSource = streamModelStatus(
      taskId,
      (data) => {
        if (data.status === "PENDING") setStatusText("⏳ Đang chờ xử lý...");
        if (data.status === "IN_PROGRESS") {
          const percent = Math.round(data.progress || 0);
          setProgress(percent);
          setStatusText(`⚙️ Đang xử lý: ${percent}%`);
        }
        if (data.status === "SUCCEEDED" && data.model_urls?.glb) {
          setProgress(100);
          setStatusText("✅ Hoàn tất! Đang hiển thị model...");
          setModelUrl(data.model_urls.glb);
          message.success("Tạo model thành công!");
          eventSource.close();
          setLoading(false);
        }
        if (data.status === "FAILED") {
          setStatusText("❌ Tạo model thất bại!");
          message.error("Tạo model thất bại!");
          eventSource.close();
          setLoading(false);
        }
      },
      (err) => {
        console.error("SSE error:", err);
        setStatusText("⚠️ Lỗi khi nhận stream!");
        setLoading(false);
      }
    );
  };

  const handleSaveModel = async () => {
    if (!taskId) return message.warning("Chưa có model nào để lưu!");
    setSaving(true);
    try {
      await saveModelToDB(taskId);
      message.success("✅ Đã lưu model vào database!");
    } catch (err) {
      console.error(err);
      message.error("Lưu model thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!modelUrl) {
      resetForm();
      return;
    }
    Modal.confirm({
      title: "Bạn có muốn lưu model vừa tạo không?",
      content: "Nếu chọn 'Có', model sẽ được lưu vào database trước khi reset.",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        await handleSaveModel();
        resetForm();
      },
      onCancel: resetForm,
    });
  };

  return (
    <div className="flex flex-row gap-8 w-full p-6 bg-gray-50 rounded-3xl shadow-inner">
      {/* --- Form bên trái --- */}
      <div className="md:w-1/3 bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">✨ Tạo Model 3D mới</h2>

          {/* --- Chọn chế độ --- */}


          {/* --- Nhập thông tin --- */}
          <div className="flex flex-col gap-4">

            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={!!modelUrl}
              className="mb-4"
            >
              <Radio.Button value="text">Tạo bằng Text</Radio.Button>
              <Radio.Button value="image">Tạo bằng Ảnh</Radio.Button>
            </Radio.Group>

            <Input
              placeholder="Nhập tên model (VD: Fox Statue)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!modelUrl}
              className="rounded-xl border-gray-300 focus:border-blue-500 focus:shadow-md"
            />

            {mode === "text" ? (
              <Input.TextArea
                rows={4}
                placeholder="Mô tả model bạn muốn tạo (VD: a cute lowpoly fox)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!!modelUrl}
                className="rounded-xl border-gray-300 focus:border-blue-500 focus:shadow-md"
              />
            ) : (
              // <Upload
              //   beforeUpload={(file) => {
              //     setImageFile(file);
              //     return false; // Không upload tự động
              //   }}
              //   maxCount={1}
              //   accept="image/*"
              //   disabled={!!modelUrl}
              // >
              //   <Button icon={<UploadOutlined />}>Chọn ảnh (JPG, PNG...)</Button>
              // </Upload>

              <Upload
                beforeUpload={(file) => {
                  setImageFile(file);
                  return false;
                }}
                maxCount={1}
                accept="image/*"
                disabled={!!modelUrl}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh (JPG, PNG...)</Button>
              </Upload>
            )}
          </div>
        </div>

        {/* --- Nút điều khiển --- */}
        <div className="mt-6 flex flex-col gap-3">
          {!modelUrl && (
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={loading}
              onClick={handleSubmit}
              className="h-11 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 transition w-full"
            >
              Gửi yêu cầu tạo model
            </Button>
          )}

          {modelUrl && (
            <>
              <Button
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSaveModel}
                className="h-11 rounded-xl font-medium border-blue-500 text-blue-600 hover:bg-blue-50 transition w-full"
              >
                Lưu model vào database
              </Button>

              <Button
                icon={<BgColorsOutlined />}
                className="h-11 rounded-xl font-medium border-green-500 text-green-600 hover:bg-green-50 transition w-full"
                onClick={() => message.info("🧩 Chức năng thêm texture sắp ra mắt!")}
              >
                Thêm texture cho model 3D
              </Button>

              <Button
                danger
                icon={<ReloadOutlined />}
                className="h-11 rounded-xl font-medium hover:bg-red-50 transition w-full"
                onClick={handleReset}
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* --- Viewer bên phải --- */}
      <div className="md:w-2/3 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-6 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-2xl">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">{statusText}</div>
            <div className="w-2/3 mt-3">
              <Progress percent={progress} status="active" />
            </div>
          </div>
        )}

        {!loading && modelUrl ? (
          <div className="w-full h-[480px] rounded-xl overflow-hidden">
            <ModelViewer meshUrl={modelUrl} />
          </div>
        ) : (
          !loading && (
            <div className="text-center text-gray-500 italic text-lg">{statusText}</div>
          )
        )}
      </div>
    </div>
  );
}
