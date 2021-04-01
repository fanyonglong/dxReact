/**
 * 商品分组-添加商品-商品列表
 * @author fanyonglong
 */
import React, { useCallback, useMemo,useState } from 'react';
import { Modal,Space } from 'antd';
import { useControllableValue } from 'ahooks';
import FilterForm,{FilterFormFieldType} from '@/components/FilterForm';
import Table,{RichTableColumnType} from '@/components/Table';
import useRequest from '@/common/hooks/useRequest';
import { getGroupProductList } from '@/services/product';
import { ImageView } from '@/components/Image';
import {useTableSelection} from '@/common/hooks'

export let GroupProductList: React.FC<any> = ({dataItem,onChange}) => {
let [{ rowSelection, selectedRows }, { clearAllSelection }] = useTableSelection({ 
    keep: true,
    onAllChange:onChange,
    getCheckboxProps(record:any){
        return {
            disabled:!!record.isOptional
        }
    }
 });
  const [{ tableProps,dataSource }, { query: showList }] = useRequest({
    service: getGroupProductList,
    params:{
        relId:dataItem.id, // 关联分组ID
        relType:dataItem.relType //商品关联类型 1.商品分组 2.diy分组
    },
    transform: (d) => {
      return {
        data: d.list,
        total: d.total,
      };
    },
  });
  const alreaySelected=useMemo(()=>dataSource.filter((d:any)=>!!d.isOptional).map((d:any)=>d.id),[dataSource])
  const fields = useMemo<FilterFormFieldType[]>(
    () => [
      {
        type: 'text',
        name: 'name',
        label: '商品信息',
        props: {
          placeholder: '请输入商口名称或商品编号',
          maxLength: 50,
        },
      },
      {
        type: 'list',
        name: 'shopId',
        label: '商品归属',
        initialValue: -1,
        data: [
          { text: '全部', value: -1 },
          { text: '送全国店', value: 1 },
          { text: '未分', value: 2 },
        ],
      },
      {
        type: 'list',
        name: 'status',
        label: '商品状态',
        initialValue: -1,
        data: [
          { text: '全部', value: -1 },
          { text: '已上架', value: 1 },
          { text: '已下架', value: 2 },
        ]
      },
    ],
    [],
  );
  const columns = useMemo<RichTableColumnType<any>[]>(
    () => [
      {
        title: '商品信息',
        dataIndex: 'productidInfo',
        render(text:any, record: any) {
          return (
            <Space>
              <ImageView
                width={60}
                height={40}
                src={record.imageUrl + '?imageView2/1/w/60/h/40'}
              ></ImageView>
              <Space direction="vertical" align="start">
                <div>{record.name}</div>
                <div>{record.productNo}</div>
              </Space>
            </Space>
          );
        },
      },
      {
        title: '商品归属',
        dataIndex: 'shopName',
      },
      {
        title: '商品状态',
        dataIndex: 'status',
        render(value:number){
            return value==1?'上架':value==2?'下架':'--'
        }
      },
      {
        title: '商品分类',
        dataIndex: 'categoryName',
      }
    ],
    [],
  );
  return (
    <div>
      <FilterForm fields={fields} autoBind onQuery={showList}></FilterForm>
      <Table scroll={{y:"calc(100vh - 500px)"}} rowKey="id" columns={columns} {...tableProps} rowSelection={{
          ...rowSelection,
          selectedRowKeys:rowSelection?.selectedRowKeys.concat(alreaySelected)
      }}></Table>
    </div>
  );
};
let GroupProductListModal: React.FC<any> = (props) => {
  let {dataItem,onOk}=props
  let [selectedRows,setSelectedRows]=useState<any[]>([])
  let [visible, setVisible] = useControllableValue(props, {
    defaultValue: false,
    defaultValuePropName: 'defaultVisible',
    valuePropName: 'visible',
    trigger: 'onCancel',
  });
  const onCancelHandle = useCallback(() => {
    setVisible(false);
    setSelectedRows([])
  }, []);
  const onChangeHandle = useCallback((selectedRows:any[]) => {
        setSelectedRows([...selectedRows])
  }, []);
  const onOkHandle=useCallback(()=>{
    if(onOk){
        onOk([...selectedRows])
        onCancelHandle()
    }
  },[onOk,selectedRows,onCancelHandle])
  let okText=`确认选择${selectedRows.length?`(${selectedRows.length})`:''}`
  return (
    <Modal
      width="70%"
      destroyOnClose
      visible={visible}
      onCancel={onCancelHandle}
      onOk={onOkHandle}
      okText={okText}
      title=" 添加商品"
    >
      <GroupProductList dataItem={dataItem} onChange={onChangeHandle}></GroupProductList>
    </Modal>
  );
};
export default GroupProductListModal;