import React, { useEffect, useState } from "react";
import { Card, Spin, Empty, message, Badge } from "antd";
import { getModels, getRefinesByModelId } from "../../../../api/modelsApi";

export default function ModelSelector({ onSelect }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refinesMap, setRefinesMap] = useState({}); // map: modelId -> refine mới nhất

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getModels();
        setModels(data || []);

        // 🔁 Lấy refine mới nhất cho từng model
        const refinePromises = data.map(async (m) => {
          try {
            const refines = await getRefinesByModelId(m.id);
            if (refines?.length) {
              const latest = refines.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )[0];
              return { modelId: m.id, refine: latest };
            }
          } catch {
            return null;
          }
        });

        const allRefines = (await Promise.all(refinePromises)).filter(Boolean);
        const map = {};
        allRefines.forEach(({ modelId, refine }) => (map[modelId] = refine));
        setRefinesMap(map);
      } catch (err) {
        console.error("Lỗi khi tải models:", err);
        message.error("Không thể tải danh sách mô hình");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Spin size="large" />
      </div>
    );

  if (!models?.length)
    return <Empty description="Không có mô hình nào" style={{ padding: 40 }} />;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 16,
      }}
    >
      {models.map((m) => {
        const refine = refinesMap[m.id];
        const hasRefine = !!refine;

        return (
          <Badge.Ribbon
            text={hasRefine ? "✨ Có refine" : "Gốc"}
            color={hasRefine ? "green" : "blue"}
            key={m.id}
          >
            <Card
              hoverable
              onClick={() => onSelect({ original: m, refine: refine || null })}
              style={{
                cursor: "pointer",
                border: hasRefine ? "2px solid #52c41a" : "1px solid #eee",
              }}
              bodyStyle={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 10,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid #eee",
                  background: "#fafafa",
                }}
              >
                <img
                  src={hasRefine ? refine.previewUrl : m.previewUrl || "/placeholder.png"}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{m.name}</p>
                <p
                  style={{
                    color:
                      m.status === "Ready"
                        ? "green"
                        : m.status === "Processing"
                        ? "#1677ff"
                        : "#999",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {hasRefine
                    ? `Refine: ${refine.prompt || "Không rõ"}`
                    : "Chưa có refine"}
                </p>
              </div>
            </Card>
          </Badge.Ribbon>
        );
      })}
    </div>
  );
}
