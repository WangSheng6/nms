import React from 'react';
import { Table, Input, Button, Icon, Modal, message } from 'antd';
import Highlighter from 'react-highlight-words';
import Bmob from "hydrogen-js-sdk";
Bmob.initialize("Secret Key", "API安全码");
var query = Bmob.Query("wine");
var dataArr = [];

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      data: [],
      loading: true,
      visible: false,
      confirmLoading: false,
      ModalText: '',
      deleteid : 0
    };
  }

  genData(reqNum = 0) {
    dataArr = [];
    query.limit(10);
    query.skip(10 * reqNum);
    query.find().then(res => {
      for (let i = 0; i < res.length; i++) {
        dataArr.push({
          key: i,
          id: `${res[i]['objectId']}`,
          name: res[i]['Name'],
          price: `${res[i]['Price']}`
        });
      }
    }).then(res => {
      setTimeout(() => this.setState({
        data: dataArr,
        loading: false
      }), 0);
    })
  }

  componentDidMount() {
    this.genData()
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    ),
  });

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  handleDelete(id, name){
    //console.log(text)
    this.setState({
      visible: true,
      ModalText: `确认删除 ${name} ?`,
      deleteid: id
    })
  }
  handleOk = () => {
    this.setState({
      confirmLoading: true,
    });

    query.destroy(this.state.deleteid).then(res => {
      
      if(res.msg == 'ok'){
        this.genData()
        this.setState({
          visible: false,
          confirmLoading: false,
        });
        message.success('删除成功');
      }
    }).catch(err => {
      console.log(err)
      message.error('删除失败');
    })

  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleOperate = (id) =>{
    this.props.history.push({pathname:'/list/'+ id})
  }

  render() {
    const columns = [
      {
        title: '商品ID',
        dataIndex: 'id',
        key: 'id',
        width: '20%',
        ...this.getColumnSearchProps('id'),
      },
      {
        title: '商品名称',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
        ...this.getColumnSearchProps('name'),
      },
      {
        title: '商品价格',
        dataIndex: 'price',
        key: 'price',
        ...this.getColumnSearchProps('price'),
      },
      {
        title: '操作',
        key: 'operate',
        render: (record) => <div><Button onClick={()=>{this.handleDelete(record.id,record.name)}} type="danger">删除</Button> <Button type="ghost" onClick={()=>{this.handleOperate(record.id)}}>编辑</Button></div>
      },
    ];
    return (
      <div>
      <Table columns={columns}
        loading={this.state.loading}
        dataSource={this.state.data}
        title={() => <Button style={{ float: 'right' }} type="primary" onClick={()=>{this.handleOperate(0)}}>新增</Button>}
      />
      <Modal
          title="删除商品"
          visible={this.state.visible}
          onOk={this.handleOk}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
        >
          <p>{this.state.ModalText}</p>
        </Modal>
      </div>
    );
  }
}

export default List;
