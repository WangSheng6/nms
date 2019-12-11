import React from 'react';
import { Form, Input, Upload, Icon, Modal, Button, Alert, message } from 'antd';
import Bmob from "hydrogen-js-sdk";
Bmob.initialize("57b561f7d48f3c2e", "191019");

const CLOUDINARY_UPLOAD_PRESET = 'timidgy3';
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dw2xr1cio/image/upload';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const CustomizedForm = Form.create({
  name: 'global_state',
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    return {
      name: Form.createFormField({
        ...props.name,
        value: props.name.value,
      }),
      price: Form.createFormField({
        ...props.price,
        value: props.price.value,
      }),
    };
  },
  onValuesChange(_, values) {
    //console.log(values);
  },
})(props => {
  const { getFieldDecorator } = props.form;
  const formItemLayout = {
    labelCol: { span: 2 },
    wrapperCol: { span: 8 },
  };
  return (
    <Form {...formItemLayout} >
      <Form.Item label="商品名称">
        {getFieldDecorator('name', {
          rules: [{ required: true, message: '商品名不能为空!' }],
        })(<Input />)}
      </Form.Item>
      <Form.Item label="商品价格">
        {getFieldDecorator('price', {
          rules: [{ required: true, message: '商品价格不能为空!' }],
        })(<Input />)}
      </Form.Item>
    </Form>
  );
});

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      loading: true,
      id: props.match.params.id,
      fileList: [],
      introList: [],
      fields: {
        name: {
          value: '',
        },
        price: {
          value: '',
        },
      },
    };

  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  handleChange = ({ file, fileList }) => {
    
    if (file.status == "done") { // 上传成功后
    
      const fileList = this.state.fileList
      fileList.pop();
      fileList.push({
          uid: file.uid,
          name: file.name,
          state: 'done',
          url: file.response.secure_url
        })
    }
    this.setState({fileList})
  }

  handleChangeIntro = ({ file, fileList }) => {
    var introList = fileList
    if (file.status == "done") { // 上传成功后
    
      introList = this.state.introList
      introList.pop();
      introList.push({
          uid: file.uid,
          name: file.name,
          state: 'done',
          url: file.response.secure_url
        })
    }
    this.setState({ introList });
  }

  handleImg(file) {
    var data = ''

    for (let i = 0; i < file.length; i++) {
      if (i == file.length - 1) {
        data += (file[i].url)
      } else {
        data += (file[i].url + '||')
      }
    }
    return data;
  }
  // 提交
  handleSubmit = () => {
    const { fileList, introList } = this.state;
    const banner = this.handleImg(fileList);
    const intro = this.handleImg(introList);

    this.setState({ loading: true });
    const query = Bmob.Query("wine");

    if (this.state.id == 0) { // 新增
      const queryArray = new Array();
      //var queryObj = Bmob.Query('tableName');
      query.set('Price', this.state.fields.price.value * 1);
      query.set('Name', this.state.fields.name.value);
      query.set('Banner', banner);
      query.set('intro', intro);

      queryArray.push(query);

      // 传入刚刚构造的数组
      Bmob.Query('wine').saveAll(queryArray).then(result => {
        console.log(result);
        message.success('新增成功！');
        this.setState({ loading: false });
      }).catch(err => {
        console.log(err);
        message.success('新增失败！');
        this.setState({ loading: false });
      });

    } else { // 编辑
      query.equalTo("objectId", "==", this.state.id);
      query.find().then(todos => {
        todos.set('Price', this.state.fields.price.value * 1);
        todos.set('Name', this.state.fields.name.value);
        todos.set('Banner', banner);
        todos.set('intro', intro);

        todos.saveAll().then(res => {
          // 成功批量修改
          console.log(res, 'ok')
          message.success('编辑成功！');
          this.setState({ loading: false });
        }).catch(err => {
          console.log(err)
          message.error('编辑失败！');
          this.setState({ loading: false });
        });
      })
    }

  };

  // 处理图片
  handleFile(data) {
    var file = [];
    var len = (data && data.split('||').length) || 0
    for (let i = 0; i < len; i++) {
      file.push({
        uid: i,
        name: `image${i}`,
        state: 'done',
        url: data.split('||')[i]
      })
    }
    return file;
  }
  // 获取数据
  genData() {

    if (this.state.id == 0) { // 新增
      this.setState({
        fields: {
          name: {
            value: '',
          },
          price: {
            value: 0
          }
        },
        fileList: [],
        introList: [],
        loading: false
      })
    } else { // 编辑
      const query = Bmob.Query("wine");
      query.equalTo("objectId", "==", this.state.id);
      query.find().then(res => {

        const data = res[0]
        setTimeout(() => {
          this.setState({
            //name: data.Name,
            fields: {
              name: {
                value: data.Name,
              },
              price: {
                value: data.Price,
              },
            },

            fileList: this.handleFile(data.Banner),
            introList: this.handleFile(data.intro)
          })
        }, 100)

      }).then(() => {
        this.setState({
          loading: false
        })
      });
    }
  }

  componentDidMount() {
    this.genData()
  }

  handleFormChange = changedFields => {
    this.setState(({ fields }) => ({
      fields: { ...fields, ...changedFields },
    }));
  };

  postData(file) {
    return {
      'upload_preset': CLOUDINARY_UPLOAD_PRESET,
      'file': file[0]
    }
  }

  goHome(){
    this.props.history.push({pathname:'/list/'})
  }

  render() {
    const { previewVisible, previewImage, fileList, introList, fields } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div style={{ 'width': '75%', 'margin': '50px auto' }}>
        <Button style={{ float: 'right' }} type="primary" onClick={this.goHome.bind(this)}>返回</Button>
        <Alert
          style={{ 'width': '50%' }}
          message="提醒："
          description="经过测试：1、图片上传大小为：500X500 最佳，且大小不宜超过 200k，否则影响加载速度"
          type="warning"
          showIcon
        />
        <br /><br />
        {/* <label>名称：</label> <Input placeholder="商品名称" value={name} allowClear ref="name" style={{ 'width': '50%', 'marginBottom': '30px' }} /> <br />
        <label>价格：</label> <Input placeholder="商品价格" defaultValue={price} allowClear ref="price" style={{ 'width': '50%', 'marginBottom': '30px' }} /> <br /> */}
        <CustomizedForm {...fields} onChange={this.handleFormChange} />
        <div className="clearfix">
          <label style={{ 'marginBottom': '15px' }}>轮播图(<font style={{ 'color': 'red' }}>最多只能5张</font>)：</label>
          <Upload
            action={CLOUDINARY_UPLOAD_URL}
            data={(fileList) => this.postData(fileList)}
            listType="picture-card"
            fileList={fileList}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>

        <div className="clearfix">
          <label style={{ 'marginBottom': '15px' }}>商品详情图(<font style={{ 'color': 'red' }}>最多只能5张</font>)：</label>
          <Upload
            action={CLOUDINARY_UPLOAD_URL}
            data={(fileList) => this.postData(fileList)}
            listType="picture-card"
            fileList={introList}
            onPreview={this.handlePreview}
            onChange={this.handleChangeIntro}
          >
            {introList.length >= 5 ? null : uploadButton}
          </Upload>
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>
        <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit} style={{ 'marginTop': '30px' }}>
          提交
      </Button>
      </div >
    )
  }
}

export default Detail;