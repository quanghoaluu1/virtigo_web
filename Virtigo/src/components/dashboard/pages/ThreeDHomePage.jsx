import { useState } from "react";
import { Button, Typography, Tabs, message } from "antd";
import { PlusOutlined, AppstoreOutlined } from "@ant-design/icons";
import ModelList from "./3d-component/ModelList";
import ModelCreateForm from "./3d-component/ModelCreateForm";

const { Title } = Typography;

export default function ThreeDHomePage() {
  const [refresh, setRefresh] = useState(false);

  const handleCreated = () => {
    message.success("Đã tạo model thành công!");
    setRefresh(!refresh);
  };

  const items = [
    {
      key: "1",
      label: (
        <span>
          <AppstoreOutlined /> Danh sách model
        </span>
      ),
      children: <ModelList key={refresh} />,
    },
    {
      key: "2",
      label: (
        <span>
          <PlusOutlined /> Tạo model mới
        </span>
      ),
      children: <ModelCreateForm onCreated={handleCreated} />,
    },
  ];

  return (
    <div className="p-6">
      <Title level={3} className="!mb-4">
        Modal 3D AI
      </Title>

      <Tabs
        defaultActiveKey="1"
        items={items}
        className="bg-white p-4 rounded-xl shadow-sm"
      />
    </div>
  );
}
