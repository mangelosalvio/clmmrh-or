import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Form, Input, Upload, message, Button, Icon, Row, Col } from "antd";

export default class FileUploadGroup extends React.Component {
  state = {
    fileList: [],
    uploading: false
  };

  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append("files", file);
    });

    Object.entries(this.props.data).forEach(entry => {
      formData.append(entry[0], entry[1]);
    });

    this.setState({
      uploading: true
    });

    axios
      .post(this.props.url, formData)
      .then(response => {
        this.props.onDoneUploading();
        this.setState({
          fileList: [],
          uploading: false
        });
        message.success("upload successfully.");
      })
      .catch(err => {
        this.setState({ uploading: false });
        message.error("upload failed.");
      });
  };

  render() {
    const { uploading, fileList } = this.state;
    const props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList
          };
        });
      },
      beforeUpload: file => {
        if (file.type === "application/pdf") {
          this.setState(state => ({
            fileList: [...state.fileList, file]
          }));
        } else {
          message.error("Must select a pdf file only");
        }

        return false;
      },
      fileList
    };

    return (
      <Row>
        <Col xs={{ span: 5, offset: 4 }}>
          <Upload {...props}>
            <Button>
              <Icon type="upload" /> Select File
            </Button>
          </Upload>
          <Button
            type="primary"
            onClick={this.handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? "Uploading" : "Start Upload"}
          </Button>
        </Col>
      </Row>
    );
  }
}
