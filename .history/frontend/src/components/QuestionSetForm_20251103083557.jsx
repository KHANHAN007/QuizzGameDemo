import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Button, Space, Divider } from 'antd'

export default function QuestionSetForm({ initialValues, onSubmit, onCancel }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        showInstantFeedback: Boolean(initialValues.showInstantFeedback),
        presentationMode: Boolean(initialValues.presentationMode),
        shuffleQuestions: initialValues.shuffleQuestions !== 0,
        shuffleChoices: Boolean(initialValues.shuffleChoices),
        allowSkip: initialValues.allowSkip !== 0,
        showScore: initialValues.showScore !== 0
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  function handleSubmit() {
    form.validateFields()
      .then(values => {
        onSubmit(values)
      })
      .catch(info => {
        console.log('Validation failed:', info)
      })
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: '',
        description: '',
        showInstantFeedback: false,
        presentationMode: false,
        timePerQuestion: 30,
        shuffleQuestions: true,
        shuffleChoices: false,
        allowSkip: true,
        showScore: true
      }}
    >
      <Form.Item
        name="name"
        label="Tên danh sách"
        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
      >
        <Input placeholder="VD: Toán học lớp 1" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea 
          rows={2} 
          placeholder="Mô tả ngắn về danh sách câu hỏi này"
        />
      </Form.Item>

      <Divider>Cấu hình chế độ chơi</Divider>

      <Form.Item
        name="showInstantFeedback"
        label="Hiển thị đúng/sai ngay lập tức"
        valuePropName="checked"
        tooltip="Khi bật, người chơi sẽ thấy đáp án đúng ngay sau khi chọn"
      >
        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
      </Form.Item>

      <Form.Item
        name="presentationMode"
        label="Chế độ trình chiếu"
        valuePropName="checked"
        tooltip="Dành cho giáo viên trình chiếu lên bảng, chỉ hiển thị câu hỏi"
      >
        <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
      </Form.Item>

      <Form.Item
        name="timePerQuestion"
        label="Thời gian mỗi câu (giây)"
        tooltip="0 = không giới hạn thời gian"
      >
        <InputNumber min={0} max={300} style={{ width: '100%' }} />
      </Form.Item>

      <Divider>Cấu hình nâng cao</Divider>

      <Form.Item
        name="shuffleQuestions"
        label="Xáo trộn thứ tự câu hỏi"
        valuePropName="checked"
      >
        <Switch checkedChildren="Có" unCheckedChildren="Không" />
      </Form.Item>

      <Form.Item
        name="shuffleChoices"
        label="Xáo trộn thứ tự đáp án"
        valuePropName="checked"
      >
        <Switch checkedChildren="Có" unCheckedChildren="Không" />
      </Form.Item>

      <Form.Item
        name="allowSkip"
        label="Cho phép bỏ qua câu hỏi"
        valuePropName="checked"
      >
        <Switch checkedChildren="Có" unCheckedChildren="Không" />
      </Form.Item>

      <Form.Item
        name="showScore"
        label="Hiển thị điểm số"
        valuePropName="checked"
      >
        <Switch checkedChildren="Có" unCheckedChildren="Không" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {initialValues ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
