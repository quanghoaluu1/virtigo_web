import { useEffect, useState } from "react";
import { Card, Spin, Empty } from "antd";
import { getModels } from "../../../../api/modelsApi";
import { useNavigate } from "react-router-dom";

export default function ModelList() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getModels();
        setModels(data || []);
      } catch (err) {
        console.error("Lỗi khi tải models:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ⏳ Khi đang tải
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  // ❌ Khi không có dữ liệu
  if (!models || models.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Empty description="Không có mô hình nào" />
      </div>
    );
  }

  // ✅ Khi có dữ liệu
  return (
    <div className="pb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((m) => (
          <Card
            key={m.id}
            hoverable
            onClick={() => navigate(`models/${m.id}`)}
            className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            bodyStyle={{
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              height: "72px",
            }}
          >
            {/* Ảnh nhỏ bên trái */}
            <div
              className="flex-shrink-0 rounded-md border border-gray-200 shadow-sm overflow-hidden bg-gray-50"
              style={{ width: "60px", height: "60px" }}
            >
              <img
                src={m.previewUrl || "/placeholder.png"}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thông tin bên phải */}
            <div className="flex flex-col justify-center overflow-hidden flex-1">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {m.name || "Chưa có tên"}
              </p>
              <p
                className={`text-xs font-medium ${
                  m.status === "Ready"
                    ? "text-green-600"
                    : m.status === "Processing"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                {m.status === "Ready"
                  ? "Hoàn tất"
                  : m.status === "Processing"
                  ? "Đang xử lý"
                  : "Chưa sẵn sàng"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
