<template>
    <div class="home">
        <input
            type="file"
            ref="upload"
            accept="image/jpeg, image/jpg, image/png"
            @change="uploadImg($event)"
        />
        <!-- 联系人列表 -->
        <van-contact-list :list="list" @add="onAdd" @edit="onEdit" />
        <!-- 联系人编辑 -->
        <van-popup v-model="showEdit" position="bottom">
            <van-contact-edit
                :contact-info="editingContact"
                :is-edit="isEdit"
                @save="onSave"
                @delete="onDelete"
            />
        </van-popup>
    </div>
</template>

<script>
import { ContactList, Toast, ContactEdit, Popup } from "vant";
import axios from "axios";
export default {
    name: "contactList",
    components: {
        [ContactList.name]: ContactList,
        [ContactEdit.name]: ContactEdit,
        [Popup.name]: Popup
    },
    data() {
        return {
            list: [],
            instance: null, // axios 实例
            showEdit: false, // 编辑弹窗的显隐
            editingContact: {}, // 正在编辑的联系人数据
            isEdit: false // 新建或编辑
        };
    },
    created() {
        this.instance = axios.create({
            baseURL: "http://localhost:9000/api",
            timeout: 1000
        });
        this.getList();
    },
    methods: {
        //   获取联系人列表
        async getList() {
            // try {
            //     let res = await this.instance.get("/contactList");
            //     this.list = res.data.data;
            // } catch {
            //     Toast("请求错误");
            // }

            let res = await this.$Http.getContactList();
            this.list = res.data;
        },
        //   添加联系人
        onAdd() {
            this.showEdit = true;
            this.isEdit = false;
        },
        //   编辑联系人
        onEdit(info) {
            this.showEdit = true;
            this.isEdit = true;
            this.editingContact = info;
        },
        //   保存联系人
        async onSave(info) {
            if (this.isEdit) {
                // 编辑保存
                // try {
                //     let res = await this.instance.put("/contact/edit", info);
                //     if (res.data.code === 200) {
                //         Toast("编辑成功");
                //         this.showEdit = false;
                //         this.getList();
                //     }
                // } catch {
                //     Toast("请求错误");
                // }

                let res = await this.$Http.editContact(info);
                if (res.code === 200) {
                    Toast("编辑成功"); // 保存成功
                    this.showEdit = false;
                    this.getList();
                    this.editingContact = {};
                }
            } else {
                // try {
                //     let res = await this.instance.post(
                //         "/contact/new/json",
                //         info
                //     );
                //     if (res.data.code === 200) {
                //         Toast("新建成功");
                //         this.showEdit = false;
                //         this.getList();
                //     }
                // } catch {
                //     Toast("请求错误");
                // }

                // 新建保存;
                let res = await this.$Http.newContactJson(info);
                if (res.code === 200) {
                    Toast("新建成功");
                    this.showEdit = false;
                    this.getList();
                    this.editingContact = {};
                }
                // let res = await this.$Http.newContactForm(info, true);
                // if (res.code === 200) {
                //     Toast("新建成功");
                //     this.showEdit = false;
                //     this.getList();
                // }
            }
        },
        // 删除联系人
        async onDelete(info) {
            // try {
            //     let res = await this.instance.delete("/contact", {
            //         params: {
            //             id: info.id
            //         }
            //     });
            //     if (res.data.code === 200) {
            //         Toast("删除成功");
            //         this.showEdit = false;
            //         this.getList();
            //     }
            // } catch {
            //     Toast("请求错误");
            // }
            let res = await this.$Http.delContact({
                id: info.id
            });
            if (res.code === 200) {
                Toast("删除成功");
                this.showEdit = false;
                this.getList();
            }
        },
        async uploadImg(e) {
            let file = e.target.files[0];
            console.log(file);

            let res = await this.$Http.newContactForm(file, true);
            if (res.code === 200) {
                Toast("新建成功");
                this.showEdit = false;
                this.getList();
            }
        }
    }
};
</script>
<style scoped>
.van-contact-list__add {
    z-index: 0;
}
.van-popup {
    height: 100%;
}
</style>