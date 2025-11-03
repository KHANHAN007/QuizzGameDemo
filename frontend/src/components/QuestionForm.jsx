import React, { useEffect } from 'react'
import { Form, Input, InputNumber, Button, Space, Radio } from 'antd'

export default function QuestionForm({ initialValues, onSubmit, onCancel }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  function handleSubmit() {
    form.validateFields()
      .then(values => {
        // Backend expects choices array format
        const backendFormat = {
          text: values.text,
          choices: values.choices, // Keep as array
          correctIndex: values.correctIndex,
          explanation: values.explanation || ''
        }
        onSubmit(backendFormat)
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
        text: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }}
    >
      <Form.Item
        name="text"
        label="Câu hỏi"
        rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Nhập câu hỏi của bạn..."
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item label="Các lựa chọn">
        <Form.List name="choices">
          {(fields) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  {...field}
                  key={field.key}
                  rules={[{ required: true, message: 'Vui lòng nhập lựa chọn!' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input
                    placeholder={`Lựa chọn ${index + 1}`}
                    prefix={<span style={{ marginRight: 8 }}>{String.fromCharCode(65 + index)}.</span>}
                  />
                </Form.Item>
              ))}
            </>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item
        name="correctIndex"
        label="Đáp án đúng"
        rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
      >
        <Radio.Group>
          <Space direction="vertical">
            <Radio value={0}>A. Lựa chọn 1</Radio>
            <Radio value={1}>B. Lựa chọn 2</Radio>
            <Radio value={2}>C. Lựa chọn 3</Radio>
            <Radio value={3}>D. Lựa chọn 4</Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="explanation"
        label="Giải thích (tùy chọn)"
        tooltip="Giải thích tại sao đáp án này đúng"
      >
        <Input.TextArea
          rows={2}
          placeholder="VD: 2 cộng 3 bằng 5..."
          showCount
          maxLength={300}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            {initialValues ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
