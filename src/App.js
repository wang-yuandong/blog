import React, {Component} from 'react';
import './App.css';

import {Layout, Menu, Breadcrumb, Icon} from 'antd';

const {Header, Footer, Sider, Content} = Layout;
const SubMenu = Menu.SubMenu;

export default class App extends Component {
    state = {
        options: [],
        menu: [],
        itemId: '',
        title: '',
        content: ''
    };

    /**
     * 向后台请求所有类型数据
     * @param param
     * @returns {Promise<any | never>}
     */
    getSelectData(param) {
        return fetch(`http://localhost:3000/getSelectData`, {
            method: 'GET',
            mode: 'cors',
        })
            .then(function (response) {
                return response.json();
            })
            .catch(reason => {
                alert('获取下拉选数据失败');
                return reason
            })
    }


    getArticlById(data) {
        return fetch(`http://localhost:3000/getArticleById?id=${data.id}`, {
            method: 'GET',
            mode: 'cors',
        })
            .then(function (response) {
                return response.json();
            })
            .catch(reason => {
                alert('获取文章数据失败');
                return reason
            })
    }

    componentWillMount() {
        this.getSelectData()
            .then(value => {
                const coolCreateTreeMap = new Map();
                for (let i = 0; i < value.length; i++) {
                    const parentId = value[i].parentId;
                    if (coolCreateTreeMap.has(parentId)) {
                        coolCreateTreeMap.get(parentId).push(value[i])
                    } else {
                        coolCreateTreeMap.set(parentId, [value[i]])
                    }
                }

                function f(arr) {
                    for (let i = 0; i < arr.length; i++) {
                        if (coolCreateTreeMap.has(arr[i].id)) {
                            arr[i]['children'] = coolCreateTreeMap.get(arr[i].id);
                            f(coolCreateTreeMap.get(arr[i].id))
                        }
                    }
                    return arr;
                }

                this.setState({options: f(coolCreateTreeMap.get('-1'))});
            });
    }

    renderMenu(arr) {
        const menu = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].children) {
                menu.push(
                    <SubMenu key={arr[i].id} title={<span>{arr[i].name}</span>}>
                        {this.renderMenu(arr[i].children)}
                    </SubMenu>
                )
            } else {
                menu.push(
                    <Menu.Item key={arr[i].id} item={{id: arr[i].id, name: arr[i].name}}>{arr[i].name}</Menu.Item>
                )
            }
        }
        return menu
    }


    menuItemClick = (data) => {
        this.setState({itemId: data.key});
        this.getArticlById({id: data.key})
            .then(value => {
                this.setState({
                    title: value[0].title,
                    content: value[0].content
                })
            })
            .catch(reason => {

            })
    };

    render() {
        return (
            <Layout style={{minHeight: '100vh'}}>
                <Sider>
                    <div className="logo"/>
                    <Menu mode="inline" onClick={this.menuItemClick}>
                        {/*此处递归渲染菜单，十分骚气*/}
                        {this.renderMenu(this.state.options)}
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{
                        background: '#fff',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div>{this.state.title}</div>
                    </Header>
                    <Content style={{margin: '16px'}}>
                        {/*<Breadcrumb style={{margin: '16px 0'}}>
                            <Breadcrumb.Item>User</Breadcrumb.Item>
                            <Breadcrumb.Item>Bill</Breadcrumb.Item>
                            <Breadcrumb.Item>wyd</Breadcrumb.Item>
                        </Breadcrumb>*/}
                        <div
                            style={{padding: 24, background: '#fff', minHeight: 360}}
                            dangerouslySetInnerHTML={{__html: this.state.content}}
                        />
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                        Ant Design ©2018 Created by Ant UED
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}