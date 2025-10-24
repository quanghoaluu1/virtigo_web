import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Input,
  Button,
  message,
  Spin,
  Typography,
  Upload,
  Switch,
  Progress,
  Segmented,
} from "antd";
import { SaveOutlined, ExperimentOutlined, UploadOutlined } from "@ant-design/icons";
import ModelViewer from "./ModelViewer";
import { getModelById,
  updateModelInfo,
  getRefinesByModelId,
  streamModelStatus,
  saveModelToDBRefine,
  createRefine } from "../../../../api/modelsApi";

const { Title } = Typography;

export default function ModelDetailPage() {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState(false);

  const [enablePbr, setEnablePbr] = useState(true);
  const [refineMode, setRefineMode] = useState("text"); // "text" hoặc "image"
  const [texturePrompt, setTexturePrompt] = useState("");
  const [textureImage, setTextureImage] = useState(null);

  const [refines, setRefines] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  const [refineTaskId, setRefineTaskId] = useState(null);
  const [refineProgress, setRefineProgress] = useState(0);
  const [refineStatusText, setRefineStatusText] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getModelById(id);
        setModel(data);
        setSelectedModel(data);

        const refinesData = await getRefinesByModelId(id);
        setRefines(refinesData);

        const processingRefine = refinesData.find(r => r.Status === "Processing");
        if (processingRefine?.MesyTaskId) {
          setSelectedModel(processingRefine);
          setRefineTaskId(processingRefine.MesyTaskId);
          listenRefineStream(processingRefine.MesyTaskId);
        }
      } catch (err) {
        message.error("Không tải được dữ liệu model!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSave = async () => {
    if (!model) return;
    setSaving(true);
    try {
      await updateModelInfo(id, {
        name: model.name,
        description: model.description,
      });
      message.success("✅ Đã lưu thay đổi!");
    } catch (err) {
      message.error("Lưu thất bại!");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const listenRefineStream = (taskId) => {
    setRefineLoading(true);
    const eventSource = streamModelStatus(
      taskId,
      async (data) => {
        if (data.status === "IN_PROGRESS") {
          const percent = Math.round(data.progress || 0);
          setRefineProgress(percent);
          setRefineStatusText(`⚙️ Đang tạo refine: ${percent}%`);
        }
        if (data.status === "SUCCEEDED" && data.model_urls?.glb) {
          setRefineProgress(100);
          setRefineStatusText("✅ Hoàn tất!");
          try {
            await saveModelToDBRefine(taskId);
            const updatedRefines = await getRefinesByModelId(id);
            setRefines(updatedRefines);
            const savedRefine = updatedRefines.find(r => r.MesyTaskId === taskId);
            if (savedRefine) setSelectedModel(savedRefine);
            message.success("Refine đã lưu vào database!");
          } catch (err) {
            console.error(err);
            message.error("Lưu refine vào DB thất bại!");
          } finally {
            eventSource.close();
            setRefineLoading(false);
            setRefineTaskId(null);
          }
        }
        if (data.status === "FAILED") {
          setRefineStatusText("❌ Tạo refine thất bại!");
          message.error("Refine thất bại!");
          eventSource.close();
          setRefineLoading(false);
        }
      },
      (err) => {
        console.error("SSE error:", err);
        setRefineStatusText("⚠️ Lỗi khi nhận stream!");
        setRefineLoading(false);
      }
    );
  };

  const handleRefine = async () => {
    if (refineMode === "text" && !texturePrompt.trim()) {
      message.warning("⚠️ Vui lòng nhập mô tả để refine!");
      return;
    }
    if (refineMode === "image" && !textureImage) {
      message.warning("⚠️ Vui lòng chọn ảnh texture để refine!");
      return;
    }

    setRefining(true);
    try {
      const { refineTaskId, refine: newRefine } = await createRefine(id, {
        enablePbr,
        texturePrompt: refineMode === "text" ? texturePrompt : undefined,
        textureImage: refineMode === "image" ? textureImage : undefined,
      });

      message.success("✨ Đã tạo refine mới!");
      setTexturePrompt("");
      setTextureImage(null);

      setRefines(prev => [newRefine, ...prev]);
      setSelectedModel(newRefine);
      setRefineTaskId(refineTaskId);
      listenRefineStream(refineTaskId);
    } catch (err) {
      message.error("❌ Tạo refine thất bại!");
      console.error(err);
    } finally {
      setRefining(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-6 bg-gray-50 rounded-3xl shadow-inner">
      {/* LEFT PANEL */}
      <div className="md:w-1/3 bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
        <div>
          <Title level={4} className="!mb-4 flex items-center gap-2 text-green-700">
            🧾 Thông tin
          </Title>

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Tên model"
              value={model?.name}
              onChange={e => setModel({ ...model, name: e.target.value })}
            />
            <Input.TextArea
              rows={4}
              placeholder="Mô tả"
              value={model?.description}
              onChange={e => setModel({ ...model, description: e.target.value })}
            />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              className="w-full"
            >
              Lưu thông tin
            </Button>
          </div>

          {/* REFINE SECTION */}
          <div className="mt-8">
            <Title level={5} className="!mb-3 text-green-700 flex items-center gap-2">
              🎨 Refine mô hình 3D
            </Title>

            <div className="mb-3 flex items-center gap-3">
              <span>Bật PBR:</span>
              <Switch checked={enablePbr} onChange={setEnablePbr} />
            </div>

            {/* 🔘 CHỌN CHẾ ĐỘ */}
            <Segmented
              options={[
                { label: "Bằng mô tả", value: "text" },
                { label: "Bằng ảnh", value: "image" },
              ]}
              value={refineMode}
              onChange={setRefineMode}
              className="mb-4"
            />

            {refineMode === "text" ? (
              <Input.TextArea
                rows={3}
                placeholder="Nhập mô tả texture (VD: gold metal, stone wall...)"
                value={texturePrompt}
                onChange={e => setTexturePrompt(e.target.value)}
              />
            ) : (
              <Upload
                beforeUpload={file => {
                  setTextureImage(file);
                  return false;
                }}
                showUploadList={textureImage ? [{ name: textureImage.name }] : false}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh texture</Button>
              </Upload>
            )}

            <Button
              type="primary"
              icon={<ExperimentOutlined />}
              loading={refining}
              onClick={handleRefine}
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
            >
              Tạo refine
            </Button>

            {/* DANH SÁCH REFINES */}
            <div className="mt-6">
              <Title level={5} className="!mb-3 text-green-700 flex items-center gap-2">
                🔹 Các refine
              </Title>
              <div className="flex flex-wrap gap-3">
                <img
                  src={model.previewUrl}
                  alt="Original"
                  className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer ${
                    selectedModel?.id === model.id
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedModel(model)}
                />
                {refines.map(r => (
                  <img
                    key={r.id}
                    src={r.previewUrl}
                    alt={r.prompt}
                    title={r.prompt}
                    className={`w-24 h-24 object-cover rounded-lg border-2 cursor-pointer ${
                      selectedModel?.id === r.id
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => setSelectedModel(r)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="md:w-2/3 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center p-6 relative">
        {refineLoading ? (
          <div className="w-full h-[480px] flex flex-col items-center justify-center rounded-xl bg-white/80">
            <Spin size="large" />
            <div className="mt-4">{refineStatusText}</div>
            <div className="w-2/3 mt-3">
              <Progress percent={refineProgress} status="active" />
            </div>
          </div>
        ) : selectedModel?.meshUrl ? (
          <div className="w-full h-[480px] rounded-xl overflow-hidden">
            <ModelViewer meshUrl={selectedModel.meshUrl} />
          </div>
        ) : (
          <div className="text-gray-500 italic text-lg">
            ⚠️ Model này chưa có file 3D để hiển thị
          </div>
        )}
      </div>
    </div>
  );
}
