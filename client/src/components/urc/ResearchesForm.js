import React, { Component } from "react";
import { connect } from "react-redux";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import "../../styles/Autosuggest.css";
import AcademicYearModalForm from "./../modals/AcademicYearModalForm";
import { debounce } from "lodash";

import {
  Layout,
  Breadcrumb,
  Form,
  Tabs,
  Divider,
  Table,
  Icon,
  message
} from "antd";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import moment from "moment";
import classnames from "classnames";
import {
  research_status,
  types_of_discipline,
  types_of_research,
  teaching_assignments,
  member_position,
  faculty_status
} from "./../../utils/Options";
import { formItemLayout, tailFormItemLayout } from "./../../utils/Layouts";
import CheckboxGroupFieldGroup from "../../commons/CheckboxGroupFieldGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import SelectObjectFieldGroup from "../../commons/SelectObjectFieldGroup";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";
import CheckboxFieldGroup from "../../commons/CheckboxFieldGroup";
import TextAreaGroup from "../../commons/TextAreaGroup";
import FileUploadGroup from "../../commons/FileUploadGroup";
const { Content } = Layout;
const TabPane = Tabs.TabPane;

const collection_name = "researches";

const form_data_proponent = {
  name: "",
  degree: "",
  specialization: "",
  faculty_status: "",
  type_of_research: "",
  position: "",
  role: ""
};

const form_data_paper_presentation = {
  dates: [],
  name_of_event: "",
  theme: "",
  name_of_presenter: "",
  country: "",
  title: "",
  venue: "",
  organizer: "",
  presentation_categories: []
};

const form_data_publication = {
  title_of_paper: "",
  title_of_research: "",
  authors: "",
  issn: "",
  year_published: "",
  journal: "",
  volume_number: "",
  issue_number: "",
  pages: "",
  editors: "",
  publisher: "",
  keywords: "",
  indexed_in: "",
  bibliographic_citation: ""
};

const form_data_panels = {
  chairperson: "",
  statistician: "",
  technical_adviser: "",
  dean: "",
  research_coordinator: "",
  department_chair: "",
  rero_technical_representative: ""
};

const form_data_funding_agency = {
  name_of_funding_agency: "",
  name_of_head: "",
  designation_of_head: "",
  email_address: "",
  contact_number: "",
  total_grant: ""
};

const form_data_attachment = {
  attachment_category: "",
  label: ""
};

const form_data = {
  [collection_name]: [],
  _id: "",

  proponent: {
    ...form_data_proponent
  },

  paper_presentation: {
    ...form_data_paper_presentation
  },

  publication: {
    ...form_data_publication
  },

  panels: {
    ...form_data_panels
  },

  funding_agency: {
    ...form_data_funding_agency
  },

  attachment: {
    ...form_data_attachment
  },

  research_title: "",
  proposed_title: "",
  final_title: "",
  date_approved: null,
  date_of_completion: null,
  research_status: "",
  research_categories: [],
  commissioned_by: "",
  research_agendas: [],
  type_of_discipline: "",
  teaching_assignment: "",
  accession_number: "",
  type_of_research: [],
  honorarium: "",
  project_budget: "",
  approved_budget: "",
  proponents: [],
  paper_presentations: [],
  publications: [],
  attachments: [],

  edit_proponent_index: null,
  edit_paper_presentation_index: null,
  edit_publication_index: null,

  academic_year: "",
  college: "",
  department: "",
  college_agendas: [],
  department_agendas: [],
  department_head: "",
  dean: "",
  venue_of_deliberation: "",

  is_an_external_funded_research: false,

  errors: {}
};

class ResearchesForm extends Component {
  state = {
    title: "Researches",
    url: "/api/researches/",
    search_keyword: "",
    ...form_data,
    uploading: false,
    options: {
      research_categories: [],
      research_agendas: [],
      academic_years: [],
      colleges: [],
      presentation_categories: [],
      attachment_categories: [],
      faculties: []
    }
  };

  constructor(props) {
    super(props);
    this.academicYearModalForm = React.createRef();

    this.onFacultySearch = debounce(this.onFacultySearch, 300);
  }

  componentDidMount() {
    this.getResearchCategories();
    this.getResearchAgendas();
    this.getAcademicYears();
    this.getColleges();
    this.getPresentationCategories();
    this.getAttachmentCategories();
  }

  onChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    this.setState({ [e.target.name]: value });
  };

  onObjectChange = (object, e) => {
    this.setState({
      [object]: {
        ...this.state[object],
        [e.target.name]: e.target.value
      }
    });
  };

  onSubmit = e => {
    e.preventDefault();

    const form_data = {
      ...this.state,
      user: this.props.auth.user
    };

    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) => {
          message.success("Transaction Saved");
          this.setState({
            ...form_data,
            proponent: { ...form_data_proponent },
            paper_presentation: { ...form_data_paper_presentation },
            publication: { ...form_data_publication },
            edit_proponent_index: null,
            edit_paper_presentation_index: null,
            edit_publication_index: null,
            ...data,
            errors: {},
            message: "Transaction Saved",
            date_approved: data.date_approved
              ? moment(data.date_approved)
              : null,
            date_of_completion: data.date_of_completion
              ? moment(data.date_of_completion)
              : null
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          message.success("Transaction Updated");
          this.setState({
            ...form_data,
            proponent: { ...form_data_proponent },
            paper_presentation: { ...form_data_paper_presentation },
            publication: { ...form_data_publication },
            edit_proponent_index: null,
            edit_paper_presentation_index: null,
            edit_publication_index: null,
            ...data,
            errors: {},
            message: "Transaction Updated",
            dob: data.dob ? moment(data.dob) : null,
            date_approved: data.date_approved
              ? moment(data.date_approved)
              : null,
            date_of_completion: data.date_of_completion
              ? moment(data.date_of_completion)
              : null
          });
        })
        .catch(err => this.setState({ errors: err.response.data }));
    }
  };

  onSearch = (value, e) => {
    e.preventDefault();
    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then(response => {
        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : ""
        });

        loading();
      })
      .catch(err => console.log(err));
  };

  getResearchCategories = () => {
    axios.get("/api/research-categories").then(response => {
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            research_categories: response.data
          }
        };
      });
    });
  };

  getResearchAgendas = () => {
    axios.get("/api/research-agendas").then(response => {
      console.log(response.data);
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            research_agendas: response.data
          }
        };
      });
    });
  };

  getAcademicYears = () => {
    axios.get("/api/academic-years").then(response => {
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            academic_years: response.data
          }
        };
      });
    });
  };

  getColleges = () => {
    axios.get("/api/colleges").then(response => {
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            colleges: response.data
          }
        };
      });
    });
  };

  getPresentationCategories = () => {
    axios.get("/api/presentation-categories").then(response => {
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            presentation_categories: response.data
          }
        };
      });
    });
  };

  getAttachmentCategories = () => {
    axios.get("/api/attachment-categories").then(response => {
      this.setState(prevState => {
        return {
          options: {
            ...prevState.options,
            attachment_categories: response.data
          }
        };
      });
    });
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {},
      message: ""
    });
  };

  onEditProponent = (record, index) => {
    this.setState({
      proponent: {
        ...record
      },
      edit_proponent_index: index
    });
  };

  onUpdateProponent = () => {
    const proponents = [...this.state.proponents];
    proponents[this.state.edit_proponent_index] = {
      ...proponents[this.state.edit_proponent_index],
      ...this.state.proponent
    };

    this.setState(
      {
        proponents,
        proponent: {
          ...form_data_proponent
        },
        edit_proponent_index: null
      },
      message.success("Proponent Updated")
    );
  };

  onDeleteProponent = (record, index) => {
    const proponents = [...this.state.proponents];
    proponents.splice(index, 1);
    this.setState({ proponents });
  };

  onDeleteAttachment = record => {
    const attachments = [...this.state.attachments];
    const index = attachments.indexOf(record);

    axios
      .post(
        `/api/researches/${this.state._id}/attachments/${record._id}/delete`,
        record
      )
      .then(response => {
        attachments.splice(index, 1);
        this.setState({
          attachments
        });
      });
  };

  onEditPaperPresentation = (record, index) => {
    this.setState({
      paper_presentation: {
        ...record,
        dates: record.dates
          ? [moment(record.dates[0]), moment(record.dates[1])]
          : []
      },
      edit_paper_presentation_index: index
    });
  };

  onUpdatePaperPresentation = () => {
    const paper_presentations = [...this.state.paper_presentations];
    paper_presentations[this.state.edit_paper_presentation_index] = {
      ...paper_presentations[this.state.edit_paper_presentation_index],
      ...this.state.paper_presentation
    };

    this.setState(
      {
        paper_presentations,
        paper_presentation: {
          ...form_data_paper_presentation
        },
        edit_paper_presentation_index: null
      },
      message.success("Paper Presentation Updated")
    );
  };

  onDeletePaperPresentation = (record, index) => {
    const paper_presentations = [...this.state.paper_presentations];
    paper_presentations.splice(index, 1);
    this.setState({ paper_presentations });
  };

  /**
   * PUBLICATION
   */

  onAddPublication = () => {
    const publications = [
      ...this.state.publications,
      {
        ...this.state.publication
      }
    ];

    this.setState({ publications, publication: { ...form_data_publication } });
  };

  onEditPublication = (record, index) => {
    this.setState({
      publication: {
        ...record,
        date: record.date ? moment(record.date) : null
      },
      edit_publication_index: index
    });
  };

  onUpdatePublication = () => {
    const publications = [...this.state.publications];
    publications[this.state.edit_publication_index] = {
      ...publications[this.state.edit_publication_index],
      ...this.state.publication
    };

    this.setState(
      {
        publications,
        publication: {
          ...form_data_publication
        },
        edit_publication_index: null
      },
      message.success("Publication Updated")
    );
  };

  onDeletePublication = (record, index) => {
    const publications = [...this.state.publications];
    publications.splice(index, 1);
    this.setState({ publications });
  };
  edit = record => {
    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + record._id)
      .then(response => {
        loading();
        const record = response.data;
        this.setState(prevState => {
          return {
            ...form_data,
            proponent: {},
            paper_presentation: {},
            publication: {},
            edit_proponent_index: null,
            edit_paper_presentation_index: null,
            edit_publication_index: null,
            [collection_name]: [],
            ...record,
            date_approved: record.date_approved
              ? moment(record.date_approved)
              : null,
            date_of_completion: record.date_of_completion
              ? moment(record.date_of_completion)
              : null,
            errors: {}
          };
        });
      })
      .catch(err => console.log(err));
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then(response => {
        this.setState({
          ...form_data,
          message: "Transaction Deleted"
        });
      })
      .catch(err => console.log(err));
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  onAddProponent = () => {
    const proponents = [
      ...this.state.proponents,
      {
        ...this.state.proponent
      }
    ];

    this.setState({
      proponents,
      proponent: {
        ...form_data_proponent
      }
    });
  };

  onAddPaperPresentation = () => {
    const paper_presentations = [
      ...this.state.paper_presentations,
      {
        ...this.state.paper_presentation
      }
    ];

    this.setState({
      paper_presentations,
      paper_presentation: {
        ...form_data_paper_presentation
      }
    });
  };

  onAddAcademicYear = () => {
    this.academicYearModalForm.current.open(academic_year => {
      this.setState({
        academic_year: academic_year.desc
      });
      this.getAcademicYears();
    });
  };

  onOpenAttachment = file => {
    axios
      .get(`${file.path}`, {
        responseType: "blob"
      })
      .then(response => {
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      });
  };

  /**
   * FACULTIES SEARCH
   */

  onFacultySearch = value => {
    this.getFaculties(value).then(faculties => {
      this.setState({
        options: {
          ...this.state.options,
          faculties
        }
      });
    });
  };

  getFaculties = value => {
    return new Promise((resolve, reject) => {
      const loading = message.loading("Loading...");
      axios
        .get(`/api/faculties/?s=${value}`)
        .then(response => {
          loading();
          resolve(response.data);
        })
        .catch(err => reject(err));
    });
  };

  render() {
    const faculties = [...this.state.options.faculties].map(o => o.name);

    const proponents_column = [
      {
        title: "Name",
        dataIndex: "name",
        fixed: "left"
      },
      {
        title: "Faculty Status",
        dataIndex: "faculty_status"
      },
      {
        title: "Degree",
        dataIndex: "degree"
      },
      {
        title: "Specialization",
        dataIndex: "specialization"
      },
      {
        title: "Type of Research",
        dataIndex: "type_of_research"
      },
      {
        title: "Position",
        dataIndex: "position"
      },
      {
        title: "Role",
        dataIndex: "role"
      },
      {
        title: "",
        key: "action",
        width: 100,
        fixed: "right",
        render: (text, record, index) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.onEditProponent(record, index)}
            />
            <Divider type="vertical" />
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteProponent(record, index)}
            />
          </span>
        )
      }
    ];

    const paper_presentation_columns = [
      {
        title: "Dates",
        dataIndex: "dates",
        render: (text, record, index) => (
          <span>
            {moment(record.dates[0]).format("ll")}-
            {moment(record.dates[1]).format("ll")}
          </span>
        )
      },
      {
        title: "Title",
        dataIndex: "title"
      },
      {
        title: "Name of Event",
        dataIndex: "name_of_event"
      },

      {
        title: "Theme",
        dataIndex: "theme"
      },
      {
        title: "Presenter",
        dataIndex: "name_of_presenter"
      },
      {
        title: "Venue",
        dataIndex: "venue"
      },
      {
        title: "Organizer",
        dataIndex: "organizer"
      },
      {
        title: "Presentation Category",
        dataIndex: "presentation_categories",
        render: (text, record, index) => (
          <span>{record.presentation_categories.join(", ")}</span>
        )
      },
      {
        title: "",
        key: "action",
        width: 100,
        render: (text, record, index) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.onEditPaperPresentation(record, index)}
            />
            <Divider type="vertical" />
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeletePaperPresentation(record, index)}
            />
          </span>
        )
      }
    ];

    const publication_columns = [
      {
        title: "Title of Paper",
        dataIndex: "title_of_paper",
        fixed: "left"
      },
      {
        title: "Title of Research",
        dataIndex: "title_of_research"
      },
      {
        title: "Author(s)",
        dataIndex: "authors"
      },
      {
        title: "Journal",
        dataIndex: "journal"
      },
      {
        title: "ISSN",
        dataIndex: "issn"
      },
      {
        title: "Year Published",
        dataIndex: "year_published"
      },
      {
        title: "Vol #",
        dataIndex: "volume_number"
      },
      {
        title: "Issue #",
        dataIndex: "issue_number"
      },
      {
        title: "Pages",
        dataIndex: "pages"
      },
      {
        title: "Editors",
        dataIndex: "editors"
      },
      {
        title: "Publisher",
        dataIndex: "publisher"
      },
      {
        title: "Keywords",
        dataIndex: "keywords"
      },
      {
        title: "Indexed In",
        dataIndex: "indexed_in"
      },
      {
        title: "Bibliographic Citation",
        dataIndex: "bibliographic_citation"
      },
      {
        title: "",
        key: "action",
        width: 100,
        fixed: "right",
        render: (text, record, index) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.onEditPublication(record, index)}
            />
            <Divider type="vertical" />
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeletePublication(record, index)}
            />
          </span>
        )
      }
    ];

    const attachments_column = [
      {
        title: "Attachment Category",
        dataIndex: "attachment_category"
      },
      {
        title: "Label",
        dataIndex: "label"
      },
      {
        title: "Files",
        dataIndex: "files",
        render: files => (
          <div>
            {files.map(file => (
              <div key={file.filename}>
                <a href="" onClick={() => this.onOpenAttachment(file)}>
                  <Icon
                    type="paper-clip"
                    theme="outlined"
                    className="pointer"
                  />{" "}
                  {file.originalname}
                </a>
              </div>
            ))}
          </div>
        )
      },
      {
        title: "",
        key: "action",
        width: 100,
        fixed: "right",
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteAttachment(record)}
            />
          </span>
        )
      }
    ];

    const records_column = [
      {
        title: "Title",
        dataIndex: "research_title"
      },
      {
        title: "Date Start",
        dataIndex: "date_approved",
        render: (text, record, index) => (
          <span>{moment(record.date_approved).format("ll")}</span>
        )
      },

      {
        title: "Exp Date of Completion",
        dataIndex: "date_of_completion",
        render: (text, record, index) => (
          <span>
            {record.date_of_completion &&
              moment(record.date_of_completion).format("ll")}
          </span>
        )
      },

      {
        title: "Proponents",
        dataIndex: "proponents",
        render: (text, record, index) => {
          const p = record.proponents.map(o => o.name);

          return <span>{p.join(", ")}</span>;
        }
      },

      {
        title: "",
        width: 100,
        key: "action",
        render: (text, record) => (
          <span>
            <Icon
              type="edit"
              theme="filled"
              className="pointer"
              onClick={() => this.edit(record)}
            />
          </span>
        )
      }
    ];
    const { errors } = this.state;

    const academic_years = this.state.options.academic_years.map(o => o.desc);

    const research_categories = this.state.options.research_categories.map(
      o => o.desc
    );

    const presentation_categories = this.state.options.presentation_categories.map(
      o => o.desc
    );

    const research_agendas = this.state.options.research_agendas.map(
      o => o.desc
    );

    const attachment_categories = this.state.options.attachment_categories.map(
      o => o.desc
    );

    return (
      <Content
        style={{ padding: "0 50px", overflow: "auto" }}
        className="is-full-height"
      >
        <AcademicYearModalForm ref={this.academicYearModalForm} />

        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Researches</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="column">
            <Searchbar
              name="search_keyword"
              onSearch={this.onSearch}
              onChange={this.onChange}
              value={this.state.search_keyword}
              onNew={this.addNew}
            />
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 24,
            overflow: "auto"
          }}
        >
          <span className="is-size-5">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          {isEmpty(this.state[collection_name]) ? (
            <Form onSubmit={this.onSubmit}>
              <Tabs type="card">
                <TabPane tab="Research Information" key="1">
                  <div>
                    <SelectFieldGroup
                      label="Academic Year"
                      name="academic_year"
                      value={this.state.academic_year}
                      onChange={value =>
                        this.setState({ academic_year: value })
                      }
                      error={errors.academic_year}
                      formItemLayout={formItemLayout}
                      options={academic_years}
                      onAddItem={this.onAddAcademicYear}
                    />

                    <TextFieldGroup
                      label="Title"
                      name="research_title"
                      value={this.state.research_title}
                      onChange={this.onChange}
                      error={errors.research_title}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Proposed Title"
                      name="proposed_title"
                      value={this.state.proposed_title}
                      onChange={this.onChange}
                      error={errors.proposed_title}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Final Title"
                      name="final_title"
                      value={this.state.final_title}
                      onChange={this.onChange}
                      error={errors.final_title}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Accession Number"
                      name="accession_number"
                      value={this.state.accession_number}
                      onChange={this.onChange}
                      error={errors.accession_number}
                      formItemLayout={formItemLayout}
                    />

                    <SelectFieldGroup
                      label="Research Status"
                      name="research_status"
                      value={this.state.research_status}
                      onChange={value =>
                        this.setState({ research_status: value })
                      }
                      error={errors.research_status}
                      formItemLayout={formItemLayout}
                      options={research_status}
                    />

                    <CheckboxGroupFieldGroup
                      label="Faculty Research Program"
                      name="research_categories"
                      value={this.state.research_categories}
                      onChange={value =>
                        this.setState({ research_categories: value })
                      }
                      error={errors.research_categories}
                      formItemLayout={formItemLayout}
                      options={research_categories}
                    />

                    <TextFieldGroup
                      label="Commissioned by"
                      name="commissioned_by"
                      value={this.state.commissioned_by}
                      onChange={this.onChange}
                      error={errors.commissioned_by}
                      formItemLayout={formItemLayout}
                    />

                    <CheckboxFieldGroup
                      label="External Funded Research"
                      name="is_an_external_funded_research"
                      checked={this.state.is_an_external_funded_research}
                      onChange={this.onChange}
                      error={errors.is_an_external_funded_research}
                      formItemLayout={formItemLayout}
                    />

                    {this.state.is_an_external_funded_research && [
                      <TextFieldGroup
                        key="1"
                        label="Funding Agency"
                        name="name_of_funding_agency"
                        value={this.state.funding_agency.name_of_funding_agency}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.name_of_funding_agency
                        }
                        formItemLayout={formItemLayout}
                      />,
                      <TextFieldGroup
                        key="2"
                        label="Name of Head"
                        name="name_of_head"
                        value={this.state.funding_agency.name_of_head}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.name_of_head
                        }
                        formItemLayout={formItemLayout}
                      />,
                      <TextFieldGroup
                        key="3"
                        label="Designation"
                        name="designation_of_head"
                        value={this.state.funding_agency.designation_of_head}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.designation_of_head
                        }
                        formItemLayout={formItemLayout}
                      />,
                      <TextFieldGroup
                        key="4"
                        label="Funding Agency Email"
                        name="email_address"
                        value={this.state.funding_agency.email_address}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.email_address
                        }
                        formItemLayout={formItemLayout}
                      />,
                      <TextFieldGroup
                        key="5"
                        label="Fund Agency Contact #"
                        name="contact_number"
                        value={this.state.funding_agency.contact_number}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.contact_number
                        }
                        formItemLayout={formItemLayout}
                      />,
                      <TextFieldGroup
                        key="6"
                        type="number"
                        label="Total Grant"
                        name="total_grant"
                        value={this.state.funding_agency.total_grant}
                        onChange={e => this.onObjectChange("funding_agency", e)}
                        error={
                          errors.funding_agency &&
                          errors.funding_agency.total_grant
                        }
                        formItemLayout={formItemLayout}
                      />
                    ]}

                    <SelectObjectFieldGroup
                      label="College"
                      name="college"
                      value={this.state.college && this.state.college.name}
                      onChange={index =>
                        this.setState({
                          college: this.state.options.colleges[index]
                        })
                      }
                      error={errors.college}
                      formItemLayout={formItemLayout}
                      data={this.state.options.colleges}
                      field="name"
                    />

                    <SelectObjectFieldGroup
                      label="Department"
                      name="college"
                      value={
                        this.state.department && this.state.department.name
                      }
                      onChange={index =>
                        this.setState({
                          department: this.state.college.college_departments[
                            index
                          ]
                        })
                      }
                      error={errors.department}
                      formItemLayout={formItemLayout}
                      data={this.state.college.college_departments || []}
                      field="name"
                    />

                    <CheckboxGroupFieldGroup
                      label="Research Agenda"
                      name="research_agendas"
                      value={this.state.research_agendas}
                      onChange={value =>
                        this.setState({ research_agendas: value })
                      }
                      error={errors.research_agendas}
                      formItemLayout={formItemLayout}
                      options={research_agendas}
                    />

                    <CheckboxGroupFieldGroup
                      label="College Agenda"
                      name="college_agendas"
                      value={this.state.college_agendas}
                      onChange={value =>
                        this.setState({ college_agendas: value })
                      }
                      error={errors.college_agendas}
                      formItemLayout={formItemLayout}
                      options={this.state.college.college_agendas}
                    />

                    <CheckboxGroupFieldGroup
                      label="Department Agenda"
                      name="department_agendas"
                      value={this.state.department_agendas}
                      onChange={value =>
                        this.setState({ department_agendas: value })
                      }
                      error={errors.department_agendas}
                      formItemLayout={formItemLayout}
                      options={
                        this.state.department
                          ? this.state.department.department_agendas
                          : []
                      }
                    />

                    <CheckboxGroupFieldGroup
                      label="Type of Research"
                      name="type_of_research"
                      value={this.state.type_of_research}
                      onChange={value =>
                        this.setState({ type_of_research: value })
                      }
                      error={errors.type_of_research}
                      formItemLayout={formItemLayout}
                      options={types_of_research}
                    />

                    <RadioGroupFieldGroup
                      label="Research Category"
                      name="type_of_discipline"
                      value={this.state.type_of_discipline}
                      onChange={this.onChange}
                      error={errors.type_of_discipline}
                      formItemLayout={formItemLayout}
                      options={types_of_discipline}
                    />

                    <RadioGroupFieldGroup
                      label="Teaching Assignment"
                      name="teaching_assignment"
                      value={this.state.teaching_assignment}
                      onChange={this.onChange}
                      error={errors.teaching_assignment}
                      formItemLayout={formItemLayout}
                      options={teaching_assignments}
                    />

                    <SelectFieldGroup
                      label="Department Head"
                      name="department_head"
                      value={this.state.department_head}
                      onChange={department_head =>
                        this.setState({
                          department_head
                        })
                      }
                      onSearch={this.onFacultySearch}
                      error={errors.department_head}
                      formItemLayout={formItemLayout}
                      options={faculties}
                      showSearch={true}
                    />

                    <SelectFieldGroup
                      label="Dean"
                      name="dean"
                      value={this.state.dean}
                      onChange={dean =>
                        this.setState({
                          dean
                        })
                      }
                      onSearch={this.onFacultySearch}
                      error={errors.dean}
                      formItemLayout={formItemLayout}
                      options={faculties}
                      showSearch={true}
                    />

                    <DatePickerFieldGroup
                      label="Date Start"
                      name="date_approved"
                      value={this.state.date_approved}
                      onChange={value =>
                        this.setState({ date_approved: value })
                      }
                      error={errors.date_approved}
                      formItemLayout={formItemLayout}
                    />

                    <DatePickerFieldGroup
                      label="Exp Date of completion"
                      name="date_of_completion"
                      value={this.state.date_of_completion}
                      onChange={value =>
                        this.setState({ date_of_completion: value })
                      }
                      error={errors.date_of_completion}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Venue of Deliberation"
                      name="venue_of_deliberation"
                      value={this.state.venue_of_deliberation}
                      onChange={this.onChange}
                      error={errors.venue_of_deliberation}
                      formItemLayout={formItemLayout}
                    />

                    <Divider orientation="left">Project Cost</Divider>

                    <TextFieldGroup
                      label="Honorarium"
                      name="honorarium"
                      value={this.state.honorarium}
                      onChange={this.onChange}
                      error={errors.honorarium}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Project Budget"
                      name="project_budget"
                      value={this.state.project_budget}
                      onChange={this.onChange}
                      error={errors.project_budget}
                      formItemLayout={formItemLayout}
                    />

                    <TextFieldGroup
                      label="Approved Budget"
                      name="approved_budget"
                      value={this.state.approved_budget}
                      onChange={this.onChange}
                      error={errors.approved_budget}
                      formItemLayout={formItemLayout}
                    />

                    <Form.Item {...tailFormItemLayout}>
                      <div className="field is-grouped">
                        <div className="control">
                          <button className="button is-primary is-small">
                            Save
                          </button>
                        </div>

                        {!isEmpty(this.state._id) ? (
                          <a
                            className="button is-danger is-outlined is-small"
                            onClick={this.onDelete}
                          >
                            <span>Delete</span>
                            <span className="icon is-small">
                              <i className="fas fa-times" />
                            </span>
                          </a>
                        ) : null}
                      </div>
                    </Form.Item>
                  </div>
                </TabPane>
                <TabPane tab="Panels" key="5">
                  <SelectFieldGroup
                    label="Chairperson"
                    name="chairperson"
                    value={this.state.panels.chairperson}
                    onChange={chairperson =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          chairperson
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />
                  <SelectFieldGroup
                    label="Statistician"
                    name="statistician"
                    value={this.state.panels.statistician}
                    onChange={statistician =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          statistician
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />
                  <SelectFieldGroup
                    label="Technical Adviser"
                    name="technical_adviser"
                    value={this.state.panels.technical_adviser}
                    onChange={technical_adviser =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          technical_adviser
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />

                  <SelectFieldGroup
                    label="Dean"
                    name="dean"
                    value={this.state.panels.dean}
                    onChange={dean =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          dean
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />

                  <SelectFieldGroup
                    label="Research Coordinator"
                    name="research_coordinator"
                    value={this.state.panels.research_coordinator}
                    onChange={research_coordinator =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          research_coordinator
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />

                  <SelectFieldGroup
                    label="Department Chair"
                    name="department_chair"
                    value={this.state.panels.department_chair}
                    onChange={department_chair =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          department_chair
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />

                  <SelectFieldGroup
                    label="RERO Tech Rep"
                    name="rero_technical_representative"
                    value={this.state.panels.rero_technical_representative}
                    onChange={rero_technical_representative =>
                      this.setState({
                        panels: {
                          ...this.state.panels,
                          rero_technical_representative
                        }
                      })
                    }
                    onSearch={this.onFacultySearch}
                    error={errors.panels && errors.panels.chairperson}
                    formItemLayout={formItemLayout}
                    options={faculties}
                    showSearch={true}
                  />

                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-primary is-small">
                          Save
                        </button>
                      </div>
                    </div>
                  </Form.Item>
                </TabPane>
                <TabPane tab="Proponents" key="2">
                  <TextFieldGroup
                    label="Name"
                    name="name"
                    value={this.state.proponent.name}
                    onChange={e => this.onObjectChange("proponent", e)}
                    error={errors.proponent && errors.proponent.name}
                    formItemLayout={formItemLayout}
                  />

                  <SelectFieldGroup
                    label="Employee Status"
                    name="faculty_status"
                    value={this.state.proponent.faculty_status}
                    onChange={value =>
                      this.setState(prevState => {
                        return {
                          proponent: {
                            ...this.state.proponent,
                            faculty_status: value
                          }
                        };
                      })
                    }
                    error={errors.faculty_status}
                    formItemLayout={formItemLayout}
                    options={faculty_status}
                  />

                  <TextFieldGroup
                    label="Degree"
                    name="degree"
                    value={this.state.proponent.degree}
                    onChange={e => this.onObjectChange("proponent", e)}
                    error={errors.proponent && errors.proponent.degree}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Specialization"
                    name="specialization"
                    value={this.state.proponent.specialization}
                    onChange={e => this.onObjectChange("proponent", e)}
                    error={errors.proponent && errors.proponent.specialization}
                    formItemLayout={formItemLayout}
                  />

                  <RadioGroupFieldGroup
                    label="Type of Research"
                    name="type_of_research"
                    value={this.state.proponent.type_of_research}
                    onChange={e => this.onObjectChange("proponent", e)}
                    error={
                      errors.proponent && errors.proponent.type_of_research
                    }
                    formItemLayout={formItemLayout}
                    options={types_of_research}
                  />

                  <SelectFieldGroup
                    label="Position"
                    name="position"
                    value={this.state.proponent.position}
                    onChange={value =>
                      this.setState(prevState => {
                        return {
                          proponent: {
                            ...this.state.proponent,
                            position: value
                          }
                        };
                      })
                    }
                    error={errors.research_status}
                    formItemLayout={formItemLayout}
                    options={member_position}
                  />

                  <TextFieldGroup
                    label="Role"
                    name="role"
                    value={this.state.proponent.role}
                    onChange={e => this.onObjectChange("proponent", e)}
                    error={errors.proponent && errors.proponent.role}
                    formItemLayout={formItemLayout}
                  />

                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_proponent_index !== null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onAddProponent}
                          value="Add"
                        />
                      </div>

                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_proponent_index === null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onUpdateProponent}
                          value="Update"
                        />
                      </div>
                    </div>
                  </Form.Item>

                  <Table
                    dataSource={this.state.proponents}
                    columns={proponents_column}
                    scroll={{ x: "max-content" }}
                    rowKey="_id"
                  />
                  <Form.Item className="m-t-1">
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small">Save</button>
                      </div>
                    </div>
                  </Form.Item>
                </TabPane>
                <TabPane tab="Research Dissemination" key="3">
                  <CheckboxGroupFieldGroup
                    label="Presentation Categories"
                    name="presentation_categories"
                    value={
                      this.state.paper_presentation.presentation_categories
                    }
                    onChange={values =>
                      this.setState(prevState => {
                        return {
                          paper_presentation: {
                            ...prevState.paper_presentation,
                            presentation_categories: values
                          }
                        };
                      })
                    }
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.presentation_categories
                    }
                    formItemLayout={formItemLayout}
                    options={presentation_categories}
                  />

                  <RangeDatePickerFieldGroup
                    label="Dates"
                    name="dates"
                    value={this.state.paper_presentation.dates}
                    onChange={dates =>
                      this.setState(prevState => {
                        return {
                          paper_presentation: {
                            ...prevState.paper_presentation,
                            dates
                          }
                        };
                      })
                    }
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.date
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Title"
                    name="title"
                    value={this.state.paper_presentation.title}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.title
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Name of Event"
                    name="name_of_event"
                    value={this.state.paper_presentation.name_of_event}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.name_of_event
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Theme"
                    name="theme"
                    value={this.state.paper_presentation.theme}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.theme
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Name of Presenter"
                    name="name_of_presenter"
                    value={this.state.paper_presentation.name_of_presenter}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.name_of_presenter
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextAreaGroup
                    label="Venue"
                    name="venue"
                    value={this.state.paper_presentation.venue}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.venue
                    }
                    formItemLayout={formItemLayout}
                    rows={4}
                  />

                  <TextFieldGroup
                    label="Country"
                    name="country"
                    value={this.state.paper_presentation.country}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.country
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Organizer"
                    name="organizer"
                    value={this.state.paper_presentation.organizer}
                    onChange={e => this.onObjectChange("paper_presentation", e)}
                    error={
                      errors.paper_presentation &&
                      errors.paper_presentation.organizer
                    }
                    formItemLayout={formItemLayout}
                  />

                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_paper_presentation_index !== null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onAddPaperPresentation}
                          value="Add"
                        />
                      </div>
                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_paper_presentation_index === null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onUpdatePaperPresentation}
                          value="Update"
                        />
                      </div>
                    </div>
                  </Form.Item>

                  <Table
                    dataSource={this.state.paper_presentations}
                    columns={paper_presentation_columns}
                    rowKey="_id"
                  />

                  <Form.Item className="m-t-1">
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small">Save</button>
                      </div>
                    </div>
                  </Form.Item>
                </TabPane>
                <TabPane tab="Publications" key="4">
                  <TextFieldGroup
                    label="Title of Paper"
                    name="title_of_paper"
                    value={this.state.publication.title_of_paper}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication && errors.publication.title_of_paper
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Title of Research"
                    name="title_of_research"
                    value={this.state.publication.title_of_research}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication && errors.publication.title_of_research
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Author(s)"
                    name="authors"
                    value={this.state.publication.authors}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.authors}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Journal"
                    name="journal"
                    value={this.state.publication.journal}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.journal}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="ISSN"
                    name="issn"
                    value={this.state.publication.issn}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.issn}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    type="number"
                    label="Year Published"
                    name="year_published"
                    value={this.state.publication.year_published}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication && errors.publication.year_published
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Volume #"
                    name="volume_number"
                    value={this.state.publication.volume_number}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication && errors.publication.volume_number
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Issue #"
                    name="issue_number"
                    value={this.state.publication.issue_number}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication && errors.publication.issue_number
                    }
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Pages"
                    name="pages"
                    value={this.state.publication.pages}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.pages}
                    formItemLayout={formItemLayout}
                  />

                  <TextAreaGroup
                    label="Editors"
                    name="editors"
                    value={this.state.publication.editors}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.editors}
                    formItemLayout={formItemLayout}
                    rows={4}
                  />

                  <TextFieldGroup
                    label="Publisher"
                    name="publisher"
                    value={this.state.publication.publisher}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.publisher}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Keywords"
                    name="keywords"
                    value={this.state.publication.keywords}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.keywords}
                    formItemLayout={formItemLayout}
                  />

                  <TextFieldGroup
                    label="Indexed In"
                    name="indexed_in"
                    value={this.state.publication.indexed_in}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={errors.publication && errors.publication.indexed_in}
                    formItemLayout={formItemLayout}
                  />

                  <TextAreaGroup
                    label="Bibliographic Citation"
                    name="bibliographic_citation"
                    value={this.state.publication.bibliographic_citation}
                    onChange={e => this.onObjectChange("publication", e)}
                    error={
                      errors.publication &&
                      errors.publication.bibliographic_citation
                    }
                    formItemLayout={formItemLayout}
                    rows={4}
                  />

                  <Form.Item {...tailFormItemLayout}>
                    <div className="field is-grouped">
                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_publication_index !== null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onAddPublication}
                          value="Add"
                        />
                      </div>
                      <div
                        className={classnames("control", {
                          "display-none":
                            this.state.edit_publication_index === null
                        })}
                      >
                        <input
                          type="button"
                          className="button is-primary is-small"
                          onClick={this.onUpdatePublication}
                          value="Update"
                        />
                      </div>
                    </div>
                  </Form.Item>

                  <Table
                    dataSource={this.state.publications}
                    columns={publication_columns}
                    scroll={{ x: "max-content" }}
                    rowKey="_id"
                  />

                  <Form.Item className="m-t-1">
                    <div className="field is-grouped">
                      <div className="control">
                        <button className="button is-small">Save</button>
                      </div>
                    </div>
                  </Form.Item>
                </TabPane>
                {!isEmpty(this.state._id) && (
                  <TabPane tab="Attachments" key="6">
                    <SelectFieldGroup
                      label="Attachment Category"
                      name="attachment_category"
                      value={this.state.attachment.attachment_category}
                      onChange={value =>
                        this.setState(prevState => {
                          return {
                            attachment: {
                              ...this.state.attachment,
                              attachment_category: value
                            }
                          };
                        })
                      }
                      error={errors.attachment_category}
                      formItemLayout={formItemLayout}
                      options={attachment_categories}
                    />

                    <TextFieldGroup
                      label="Label"
                      name="label"
                      value={this.state.attachment.label}
                      onChange={e => this.onObjectChange("attachment", e)}
                      error={errors.attachment && errors.attachment.label}
                      formItemLayout={formItemLayout}
                    />

                    <FileUploadGroup
                      style={tailFormItemLayout.wrapperCol}
                      url={`/api/researches/${this.state._id}/upload`}
                      data={{
                        label: this.state.attachment.label,
                        attachment_category: this.state.attachment
                          .attachment_category
                      }}
                      onDoneUploading={() => this.edit({ _id: this.state._id })}
                    />

                    <Table
                      style={{ marginTop: "8px" }}
                      dataSource={this.state.attachments}
                      columns={attachments_column}
                      rowKey="_id"
                    />
                  </TabPane>
                )}
              </Tabs>
            </Form>
          ) : (
            <Table
              dataSource={this.state[collection_name]}
              columns={records_column}
              rowKey={record => record._id}
            />
          )}
        </div>
      </Content>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapToState)(ResearchesForm);
