import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import TextFieldGroup from "../../commons/TextFieldGroup";
import axios from "axios";
import isEmpty from "../../validation/is-empty";
import MessageBoxInfo from "../../commons/MessageBoxInfo";
import Searchbar from "../../commons/Searchbar";
import classnames from "classnames";
import {
  Layout,
  Breadcrumb,
  Form,
  Table,
  Icon,
  message,
  Divider,
  Tabs,
  Button,
  Row,
  Col,
  Input,
  Select,
  Modal,
  PageHeader,
  Collapse
} from "antd";
import {
  formItemLayout,
  tailFormItemLayout,
  smallFormItemLayout,
  smallTailFormItemLayout
} from "./../../utils/Layouts";
import DatePickerFieldGroup from "../../commons/DatePickerFieldGroup";
import TextAreaGroup from "../../commons/TextAreaGroup";
import RadioGroupFieldGroup from "../../commons/RadioGroupFieldGroup";
import {
  case_options,
  classification_options,
  gender_options,
  service_options,
  case_order_options,
  operation_type_options,
  laterality_options,
  operating_room_number_options,
  operation_status_options,
  weight_unit_options,
  bed_number_options,
  anes_unit_options,
  anes_route_options,
  anes_method_options,
  classification_housecase,
  classification_service
} from "../../utils/Options";
import moment from "moment";
import SelectFieldGroup from "../../commons/SelectFieldGroup";
import SimpleSelectFieldGroup from "../../commons/SimpleSelectFieldGroup";
import DateTimePickerFieldGroup from "../../commons/DateTimePickerFieldGroup";
import CheckboxFieldGroup from "../../commons/CheckboxFieldGroup";
import TextAreaAutocompleteGroup from "../../commons/TextAreaAutocompleteGroup";
import { debounce } from "lodash";
import {
  OPERATION_STATUS_ON_SCHEDULE,
  IN_HOLDING_ROOM,
  ON_RECOVERY,
  EMERGENCY_PROCEDURE,
  ELECTIVE_SURGERY,
  RECEIVING_MODULE,
  PRE_OPERATION_MODULE,
  POST_OPERATION_MODULE,
  TIME_LOGS_MODULE,
  CASE_EMERGENCY_PROCEDURE,
  CLASSIFICATION_PRIVATE,
  CLASSIFICATION_HOUSECASE,
  CLASSIFICATION_SERVICE
} from "./../../utils/constants";
import TextFieldAutocompleteGroup from "../../commons/TextFieldAutocompleteGroup";
import CheckboxGroup from "antd/lib/checkbox/Group";
import RangeDatePickerFieldGroup from "../../commons/RangeDatePickerFieldGroup";

const { Content } = Layout;
const TabPane = Tabs.TabPane;
const { Option } = Select;
const { confirm } = Modal;
const { Panel } = Collapse;

const collection_name = "slips";

const form_data = {
  [collection_name]: [],
  _id: "",

  name: "",
  age: "",
  address: "",
  sex: "",
  weight: "",
  weight_unit: "kg",
  hospital_number: "",
  ward: "",
  date_of_birth: null,
  registration_date: null,
  service: "",
  diagnosis: "",
  procedure: "",
  case: "",
  surgeon: "",
  other_surgeons: [],

  classification: "",
  date_time_ordered: null,
  date_time_received: null,
  surgery_is_date: true,
  date_time_of_surgery: null,
  case_order: "",
  received_by: "",

  operation_type: "",
  operation_status: OPERATION_STATUS_ON_SCHEDULE,
  main_anes: "",
  other_anes_input: "",
  other_anes: [],
  laterality: "",
  operating_room_number: "",
  bed_number: "",

  assistant_surgeon: "",
  instrument_nurse: "",
  other_inst_nurse: "",
  other_inst_nurses: [],
  other_sponge_nurse: "",
  other_sponge_nurses: [],
  sponge_nurse: "",
  anes_methods: [],
  anes_method: "",
  anes_method_others: "",

  anes_used: "",
  anes_quantity: "",
  anes_route: "",

  anesthetics: [],

  anes_start: null,
  operation_started: null,
  operation_finished: null,
  tentative_diagnosis: "",
  final_diagnosis: "",
  before_operation: "",
  during_operation: "",
  after_operation: "",
  complications_during_operation: "",
  complications_after_operation: "",
  operation_performed: "",
  position_in_bed: "",
  proctoclysis: "",
  hypodermoclysis: "",
  nutrition: "",
  stimulant: "",
  asa: "",

  time_ward_informed: null,
  arrival_time: null,
  room_is_ready: null,
  equip_ready: null,
  patient_placed_in_or_table: null,
  time_anes_arrived: null,
  time_surgeon_arrived: null,
  induction_time: null,
  induction_completed: null,
  time_or_started: null,
  or_ended: null,
  trans_out_from_or: null,
  surgical_safety_checklist: null,
  remarks: "",

  rvs_code: "",
  rvs_description: "",
  rvs_laterality: "",

  rvs: [],

  errors: {}
};

class OperatingRoomSlipForm extends Component {
  state = {
    title: "Operating Room Form",
    url: "/api/operating-room-slips/",
    search_keyword: "",
    ...form_data,
    options: {
      surgeons: [],
      anesthesiologists: [],
      nurses: [],
      rvs: [],
      patients: []
    },
    current_page: 1,
    selected_row_keys: [],

    search_period_covered: [null, null],
    search_procedure: "",
    search_operating_room_number: "",
    search_main_anes: "",
    search_surgeon: "",
    search_classification: "",
    search_service: ""
  };

  constructor(props) {
    super(props);
    this.onRvsSearch = debounce(this.onRvsSearch, 300);
    this.onSearchPatient = debounce(this.onSearchPatient, 500);
    this.anes_used_input = React.createRef();
    this.anes_quantity_input = React.createRef();
    this.anes_quantity_unit_input = React.createRef();
    this.anes_route_input = React.createRef();
  }

  componentDidMount() {
    this.searchRecords();
  }

  onChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    this.setState({ [e.target.name]: value });
  };

  onChangeCase = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    this.setState({ [e.target.name]: value });

    if (
      e.target.name === "case" &&
      e.target.value === CASE_EMERGENCY_PROCEDURE &&
      isEmpty(this.state.date_time_of_surgery)
    ) {
      this.setState({ date_time_of_surgery: moment() });
    }
  };

  onSubmit = (e, { form }) => {
    e.preventDefault();

    const form_data = {
      ...this.state,
      form,
      user: this.props.auth.user
    };

    const loading = message.loading("Processing...");
    if (isEmpty(this.state._id)) {
      axios
        .put(this.state.url, form_data)
        .then(({ data }) => {
          const {
            registration_date,
            date_time_ordered,
            date_time_of_surgery,
            date_time_received,
            anes_start,
            operation_started,
            operation_finished,
            time_ward_informed,
            arrival_time,
            room_is_ready,
            equip_ready,
            patient_placed_in_or_table,
            time_anes_arrived,
            time_surgeon_arrived,
            induction_time,
            induction_completed,
            time_or_started,
            or_ended,
            trans_out_from_or,
            surgical_safety_checklist,
            date_of_birth
          } = data;

          message.success("Transaction Saved");
          this.searchRecords();

          /* loading();
          this.setState({
            ...form_data,
            ...data,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,

            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
              : null,
            errors: {}
          }); */
        })
        .catch(err => {
          loading();
          message.error("You have an invalid input");
          this.setState({ errors: err.response.data });
        });
    } else {
      axios
        .post(this.state.url + this.state._id, form_data)
        .then(({ data }) => {
          const {
            date_of_birth,
            registration_date,
            date_time_ordered,
            date_time_received,
            date_time_of_surgery,
            anes_start,
            operation_started,
            operation_finished,

            time_ward_informed,
            arrival_time,
            room_is_ready,
            equip_ready,
            patient_placed_in_or_table,
            time_anes_arrived,
            time_surgeon_arrived,
            induction_time,
            induction_completed,
            time_or_started,
            or_ended,
            trans_out_from_or,
            surgical_safety_checklist
          } = data;

          loading();
          message.success("Transaction Updated");
          this.searchRecords();
          /* this.setState({
            ...form_data,
            ...data,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,
            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
              : null,
            errors: {}
          }); */
        })
        .catch(err => {
          loading();
          message.error("You have an error");
          this.setState({ errors: err.response.data });
        });
    }
  };

  onSearch = (value, e) => {
    e.preventDefault();
    this.searchRecords();
  };

  searchRecords = () => {
    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + "?s=" + this.state.search_keyword)
      .then(response => {
        loading();
        this.setState({
          [collection_name]: response.data,
          message: isEmpty(response.data) ? "No rows found" : ""
        });
      })
      .catch(err => {
        loading();
        message.error("An error has occurred");
        console.log(err);
      });
  };

  addNew = () => {
    this.setState({
      ...form_data,
      errors: {},
      message: ""
    });
  };

  edit = record => {
    const loading = message.loading("Loading...");
    axios
      .get(this.state.url + record._id)
      .then(response => {
        loading();
        const record = response.data;
        const {
          date_of_birth,
          registration_date,
          date_time_ordered,
          date_time_of_surgery,
          date_time_received,
          anes_start,
          operation_started,
          operation_finished,
          time_ward_informed,
          arrival_time,
          room_is_ready,
          equip_ready,
          patient_placed_in_or_table,
          time_anes_arrived,
          time_surgeon_arrived,
          induction_time,
          induction_completed,
          time_or_started,
          or_ended,
          trans_out_from_or,
          surgical_safety_checklist
        } = response.data;
        this.setState(prevState => {
          return {
            ...form_data,
            [collection_name]: [],
            ...record,
            date_of_birth: date_of_birth ? moment(date_of_birth) : null,
            registration_date: registration_date
              ? moment(registration_date)
              : null,
            date_time_ordered: date_time_ordered
              ? moment(date_time_ordered)
              : null,
            date_time_received: date_time_received
              ? moment(date_time_received)
              : null,
            date_time_of_surgery: date_time_of_surgery
              ? moment(date_time_of_surgery)
              : null,
            anes_start: anes_start ? moment(anes_start) : null,
            operation_started: operation_started
              ? moment(operation_started)
              : null,
            operation_finished: operation_finished
              ? moment(operation_finished)
              : null,

            time_ward_informed: time_ward_informed
              ? moment(time_ward_informed)
              : null,
            arrival_time: arrival_time ? moment(arrival_time) : null,
            room_is_ready: room_is_ready ? moment(room_is_ready) : null,
            equip_ready: equip_ready ? moment(equip_ready) : null,
            patient_placed_in_or_table: patient_placed_in_or_table
              ? moment(patient_placed_in_or_table)
              : null,
            time_anes_arrived: time_anes_arrived
              ? moment(time_anes_arrived)
              : null,
            time_surgeon_arrived: time_surgeon_arrived
              ? moment(time_surgeon_arrived)
              : null,
            induction_time: induction_time ? moment(induction_time) : null,
            induction_completed: induction_completed
              ? moment(induction_completed)
              : null,
            time_or_started: time_or_started ? moment(time_or_started) : null,
            or_ended: or_ended ? moment(or_ended) : null,
            trans_out_from_or: trans_out_from_or
              ? moment(trans_out_from_or)
              : null,
            surgical_safety_checklist: surgical_safety_checklist
              ? moment(surgical_safety_checklist)
              : null,
            errors: {}
          };
        });
      })
      .catch(err => {
        loading();
        message.error("An error has occurred");
        console.log(err);
      });
  };

  onDelete = () => {
    axios
      .delete(this.state.url + this.state._id)
      .then(response => {
        message.success("Transaction Deleted");
        this.searchRecords();
        /* this.setState({
          ...form_data,
          message: "Transaction Deleted"
        });*/
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  onHide = () => {
    this.setState({ message: "" });
  };

  /**
   * SURGEONS
   */

  onSurgeonSearch = value => {
    axios
      .get(`/api/surgeons/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            surgeons: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onSurgeonChange = (index, name) => {
    if (!isEmpty(index)) {
      this.setState(prevState => {
        return {
          [name]: prevState.options.surgeons[index]
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  onOtherInstNurseChange = (index, name) => {
    if (!isEmpty(index)) {
      const other_inst_nurses = [
        ...this.state.other_inst_nurses,
        this.state.options.nurses[index]
      ];
      this.setState(prevState => {
        return {
          other_inst_nurses,
          [name]: ""
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  onOtherSpongeNurseChange = (index, name) => {
    if (!isEmpty(index)) {
      const other_sponge_nurses = [
        ...this.state.other_sponge_nurses,
        this.state.options.nurses[index]
      ];
      this.setState(prevState => {
        return {
          other_sponge_nurses,
          [name]: ""
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  onOtherSurgeonChange = (index, name) => {
    if (!isEmpty(index)) {
      const other_surgeons = [
        ...this.state.other_surgeons,
        this.state.options.surgeons[index]
      ];
      this.setState(prevState => {
        return {
          other_surgeons,
          [name]: ""
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  onOtherAnesChange = (index, name) => {
    if (!isEmpty(index)) {
      const other_anes = [
        ...this.state.other_anes,
        this.state.options.anesthesiologists[index]
      ];
      this.setState(prevState => {
        return {
          other_anes,
          [name]: ""
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  /**
   * NURSES
   */

  onNurseSearch = value => {
    axios
      .get(`/api/nurses/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            nurses: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onNurseChange = (index, name) => {
    if (!isEmpty(index)) {
      this.setState(prevState => {
        return {
          [name]: prevState.options.nurses[index]
        };
      });
    } else {
      this.setState({
        [name]: null
      });
    }
  };

  /**
   * ANESTHESIOLOGISTS
   */

  onAnesSearch = value => {
    axios
      .get(`/api/anesthesiologists/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            anesthesiologists: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onAnesChange = index => {
    if (!isEmpty(index)) {
      this.setState(prevState => {
        return {
          main_anes: prevState.options.anesthesiologists[index]
        };
      });
    } else {
      this.setState({
        main_anes: null
      });
    }
  };

  onRvsCodeLookup = e => {
    e.preventDefault();
    const loading = message.loading("Loading...");
    axios
      .get(`/api/relative-value-scales/${this.state.rvs_code}/code`)
      .then(response => {
        loading();
        if (response.data) {
          this.setState({
            rvs_description: response.data.description
          });
          message.success("RVU Found");
        } else {
          message.error("RVU not Found");
        }
      });
  };

  /**
   * RVU Desc
   */

  onRvsSearch = value => {
    axios
      .get(`/api/relative-value-scales/listings/?s=${value}`)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            rvs: response.data
          }
        })
      )
      .catch(err => console.log(err));
  };

  onRvsSelect = value => {
    const index = this.state.options.rvs.map(o => o.description).indexOf(value);
    const rvs_code = this.state.options.rvs[index].code;

    this.setState({
      rvs_code,
      rvs_description: value
    });
  };

  onAddRvs = () => {
    const rvs = [
      ...this.state.rvs,
      {
        rvs_code: this.state.rvs_code,
        rvs_description: this.state.rvs_description,
        rvs_laterality: this.state.rvs_laterality
      }
    ];

    this.setState({
      rvs,
      rvs_code: "",
      rvs_description: "",
      rvs_laterality: ""
    });
  };

  onDeleteRvs = index => {
    const rvs = [...this.state.rvs];
    rvs.splice(index, 1);
    this.setState({
      rvs
    });
  };

  onAddAnesthetic = () => {
    const anesthetics = [
      ...this.state.anesthetics,
      {
        anes_used: this.state.anes_used,
        anes_quantity: this.state.anes_quantity,
        anes_quantity_unit: this.state.anes_quantity_unit,
        anes_route: this.state.anes_route
      }
    ];

    this.setState({
      anesthetics,
      anes_used: "",
      anes_quantity: "",
      anes_quantity_unit: "",
      anes_route: ""
    });
  };

  onDeleteAnesthetics = index => {
    const anesthetics = [...this.state.anesthetics];
    anesthetics.splice(index, 1);
    this.setState({
      anesthetics
    });
  };

  onDeleteOtherSurgeon = index => {
    const other_surgeons = [...this.state.other_surgeons];
    other_surgeons.splice(index, 1);
    this.setState({
      other_surgeons
    });
  };

  onDeleteOtherAnes = index => {
    const other_anes = [...this.state.other_anes];
    other_anes.splice(index, 1);
    this.setState({
      other_anes
    });
  };

  onDeleteOtherInstNurse = index => {
    const other_inst_nurses = [...this.state.other_inst_nurses];
    other_inst_nurses.splice(index, 1);
    this.setState({
      other_inst_nurses
    });
  };

  onDeleteOtherSpongeNurse = index => {
    const other_sponge_nurse = [...this.state.other_sponge_nurse];
    other_sponge_nurse.splice(index, 1);
    this.setState({
      other_sponge_nurse
    });
  };

  onDeleteAnesMethod = index => {
    const anes_methods = [...this.state.anes_methods];
    anes_methods.splice(index, 1);
    this.setState({
      anes_methods
    });
  };

  onChangeDateOfBirth = date_of_birth => {
    let now = moment();

    const dob = date_of_birth.clone();
    let years = now.diff(dob, "years");
    dob.add(years, "years");

    let months = now.diff(dob, "months");
    dob.add(months, "months");

    let days = now.diff(dob, "days");

    let age = `${years}Y${months}M${days}D`;

    this.setState({
      age,
      date_of_birth
    });
  };

  onSearchPatient = search_text => {
    const form_data = {
      search_text
    };

    axios
      .post("/api/operating-room-slips/patients", form_data)
      .then(response =>
        this.setState({
          options: {
            ...this.state.options,
            patients: response.data
          }
        })
      )
      .catch(err => message.error("There was an error connecting to Bizbox"));
  };

  onSelectPatient = name => {
    const patient = this.state.options.patients.find(o => o.fullname === name);

    if (patient) {
      const hospital_number = patient.abbrev;
      const diagnosis = patient.diagnosis;
      const weight = patient.weight;
      /* const weight_unit = patient.weightunit; */
      const address = patient.address;
      const registration_date = moment(patient.regisdate);
      const sex = patient.sex === "F" ? "Female" : "Male";
      const ward = patient.rmno;

      let now = registration_date.clone();
      const dob = moment(patient.birthdate);
      let years = now.diff(dob, "years");
      dob.add(years, "years");

      let months = now.diff(dob, "months");
      dob.add(months, "months");

      let days = now.diff(dob, "days");
      let age = `${years}Y${months}M${days}D`;

      //let age = patient.age.trim();

      let classification = "";

      if (classification_housecase.includes(patient.hospplan.trim())) {
        classification = CLASSIFICATION_HOUSECASE;
      } else if (classification_service.includes(patient.hospplan.trim())) {
        classification = CLASSIFICATION_SERVICE;
      }

      this.setState({
        hospital_number,
        diagnosis,
        weight,
        address,
        registration_date,
        sex,
        ward,
        /* weight_unit, */
        age,
        date_of_birth: moment(patient.birthdate),
        classification
      });
    }
  };

  onChangePage = current_page => {
    this.setState({
      current_page
    });
  };

  onDeleteSelection = () => {
    confirm({
      title: "Do you Want to delete these items?",
      content: "Would you like to proceed?",
      onOk: () => {
        const form_data = {
          items: this.state.selected_row_keys,
          search_keyword: this.state.search_keyword
        };

        const loading = message.loading("Processing...");
        axios
          .delete(`/api/operating-room-slips/selection`, {
            data: form_data
          })
          .then(response => {
            loading();
            message.success("Items Deleted");
            this.searchRecords();
            this.setState({
              selected_row_keys: []
            });
          })
          .catch(err => {
            loading();
            message.error("There was an error processing your request.");
          });
      },
      onCancel: () => {
        console.log("Cancel");
      },
      okText: "Delete",
      okType: "danger"
    });
  };

  onAdvancedSearch = () => {
    const {
      search_period_covered,
      search_operating_room_number,
      search_surgeon,
      search_procedure,
      search_classification,
      search_main_anes,
      search_service
    } = this.state;

    const form_data = {
      search_period_covered,
      search_operating_room_number,
      search_surgeon,
      search_procedure,
      search_classification,
      search_main_anes,
      search_service
    };

    axios
      .post("/api/operating-room-slips/advanced-search", form_data)
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            [collection_name]: response.data
          });
        } else {
          message.info("No records were found");
        }
      });
  };

  render() {
    const rowSelection = {
      onChange: (selected_row_keys, selected_rows) => {
        this.setState({ selected_row_keys });
      }
    };

    const rvs_column = [
      {
        title: "RVU Code",
        dataIndex: "rvs_code"
      },
      {
        title: "RVU Description",
        dataIndex: "rvs_description"
      },
      {
        title: "RVU Description",
        dataIndex: "rvs_description"
      },
      {
        title: "Laterality",
        dataIndex: "rvs_laterality"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteRvs(index)}
            />
          </span>
        )
      }
    ];

    const anesthetics_column = [
      {
        title: "Used",
        dataIndex: "anes_used"
      },
      {
        title: "Qty",
        dataIndex: "anes_quantity"
      },
      {
        title: "Unit",
        dataIndex: "anes_quantity_unit"
      },
      {
        title: "Route",
        dataIndex: "anes_route"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteAnesthetics(index)}
            />
          </span>
        )
      }
    ];

    const anes_methods_column = [
      {
        title: "Method",
        dataIndex: "method"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteAnesMethod(index)}
            />
          </span>
        )
      }
    ];

    const other_inst_nurses_column = [
      {
        title: "Other Inst Nurse",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteOtherInstNurse(index)}
            />
          </span>
        )
      }
    ];

    const other_sponge_nurses_column = [
      {
        title: "Other Sponge Nurse",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteOtherSpongeNurse(index)}
            />
          </span>
        )
      }
    ];

    const other_surgeons_column = [
      {
        title: "Other Surgeon",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteOtherSurgeon(index)}
            />
          </span>
        )
      }
    ];

    const other_anes_column = [
      {
        title: "Other Anesthesiologist",
        dataIndex: "full_name"
      },
      {
        title: "",
        key: "action",
        width: 10,
        render: (text, record, index) => (
          <span>
            <Icon
              type="delete"
              theme="filled"
              className="pointer"
              onClick={() => this.onDeleteOtherAnes(index)}
            />
          </span>
        )
      }
    ];

    const records_column = [
      {
        title: "Hospital #",
        dataIndex: "hospital_number"
      },
      {
        title: "Ward",
        dataIndex: "ward"
      },
      {
        title: "Patient Name",
        dataIndex: "name"
      },
      {
        title: "Age",
        dataIndex: "age"
      },
      {
        title: "Sex",
        dataIndex: "sex"
      },
      {
        title: "Diagnosis",
        dataIndex: "diagnosis"
      },
      {
        title: "Procedure",
        dataIndex: "procedure"
      },
      {
        title: "Surgeon",
        dataIndex: "surgeon.full_name"
      },
      {
        title: "Anesthesiologist",
        dataIndex: "main_anes.full_name"
      },
      {
        title: "OR Room",
        dataIndex: "operating_room_number"
      },
      {
        title: "Service",
        dataIndex: "service"
      },
      {
        title: "Surgery Date",
        dataIndex: "date_time_of_surgery",
        render: value => (
          <span>{value && moment(value).format("MM/DD/YYYY")}</span>
        )
      },
      {
        title: "Classification",
        dataIndex: "classification"
      },
      {
        title: "Status",
        dataIndex: "operation_status"
      },
      {
        title: "Case",
        dataIndex: "case",
        render: value => (
          <div
            style={{
              width: "100%",
              height: "100%",
              padding: "3px",
              textAlign: "center"
            }}
            className={classnames("case", {
              "is-emergency": value === EMERGENCY_PROCEDURE,
              elective: value === ELECTIVE_SURGERY
            })}
          >
            {value}
          </div>
        )
      },
      {
        title: "",
        key: "action",
        width: 10,
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

    const rvs_desc_data_source = this.state.options.rvs.map(o => o.description);

    const patients = this.state.options.patients.map(o => o.fullname);

    return (
      <Content className="content">
        <div className="columns is-marginless">
          <div className="column">
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Operating Room Slip</Breadcrumb.Item>
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

        <Row>
          <Col span={24} className="m-b-1">
            <Collapse>
              <Panel header="Advance Search">
                <PageHeader
                  backIcon={false}
                  style={{
                    border: "1px solid rgb(235, 237, 240)"
                  }}
                  onBack={() => null}
                  title="Advance Filter"
                  subTitle="Enter appropriate data to filter records"
                >
                  <div className="or-slip-form">
                    <Row>
                      <Col span={8}>
                        <RangeDatePickerFieldGroup
                          label="Date of Surgery"
                          name="period_covered"
                          value={this.state.search_period_covered}
                          onChange={dates =>
                            this.setState({ search_period_covered: dates })
                          }
                          error={errors.period_covered}
                          formItemLayout={smallFormItemLayout}
                        />
                      </Col>
                      <Col span={8}>
                        <SimpleSelectFieldGroup
                          label="OR Number"
                          name="search_operating_room_number"
                          value={this.state.search_operating_room_number}
                          onChange={value =>
                            this.setState({
                              search_operating_room_number: value
                            })
                          }
                          formItemLayout={smallFormItemLayout}
                          error={errors.operating_room_number}
                          options={operating_room_number_options}
                        />
                      </Col>
                      <Col span={8}>
                        <SelectFieldGroup
                          label="Surgeon"
                          name="search_surgeon"
                          value={
                            this.state.search_surgeon &&
                            this.state.search_surgeon.full_name
                          }
                          onChange={index =>
                            this.setState({
                              search_surgeon: this.state.options.surgeons[index]
                            })
                          }
                          onSearch={this.onSurgeonSearch}
                          error={errors.search_surgeon}
                          formItemLayout={smallFormItemLayout}
                          data={this.state.options.surgeons}
                          column="full_name"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <TextFieldGroup
                          label="Procedure"
                          name="search_procedure"
                          value={this.state.search_procedure}
                          error={errors.search_procedure}
                          formItemLayout={smallFormItemLayout}
                          onChange={this.onChange}
                        />
                      </Col>
                      <Col span={8}>
                        <RadioGroupFieldGroup
                          label="Classification"
                          name="search_classification"
                          value={this.state.search_classification}
                          onChange={this.onChange}
                          error={errors.search_classification}
                          formItemLayout={smallFormItemLayout}
                          options={["All", ...classification_options]}
                        />
                      </Col>
                      <Col span={8}>
                        <SelectFieldGroup
                          label="Main Anes"
                          name="search_main_anes"
                          value={
                            this.state.search_main_anes &&
                            this.state.search_main_anes.full_name
                          }
                          onChange={index =>
                            this.setState({
                              search_main_anes: this.state.options
                                .anesthesiologists[index]
                            })
                          }
                          onSearch={this.onAnesSearch}
                          error={errors.search_main_anes}
                          formItemLayout={smallFormItemLayout}
                          data={this.state.options.anesthesiologists}
                          column="full_name"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <SimpleSelectFieldGroup
                          label="Service"
                          name="search_service"
                          value={this.state.search_service}
                          onChange={value =>
                            this.setState({ search_service: value })
                          }
                          formItemLayout={smallFormItemLayout}
                          error={errors.search_service}
                          options={service_options}
                        />
                      </Col>
                      <Col span={8} />
                      <Col span={8} />
                    </Row>
                    <Row>
                      <Col span={8}>
                        <Row>
                          <Col offset={8} span={12}>
                            <Button
                              type="info"
                              size="small"
                              icon="search"
                              onClick={() => this.onAdvancedSearch()}
                            >
                              Search
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                      <Col span={8}></Col>
                      <Col span={8}></Col>
                    </Row>
                  </div>
                </PageHeader>
              </Panel>
            </Collapse>
          </Col>
        </Row>

        <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
          <span className="is-size-6">{this.state.title}</span> <hr />
          <MessageBoxInfo message={this.state.message} onHide={this.onHide} />
          {isEmpty(this.state[collection_name]) ? (
            <Tabs>
              <TabPane tab="Operating Complex Receiving" key="1">
                <Form
                  onSubmit={e => this.onSubmit(e, { form: RECEIVING_MODULE })}
                  className="tab-content or-slip-form"
                >
                  <Divider orientation="left">Patient Information</Divider>

                  <Row className>
                    <Col span={12}>
                      <TextFieldAutocompleteGroup
                        label="Name"
                        value={this.state.name}
                        dataSource={patients}
                        onSelect={this.onSelectPatient}
                        onChange={value => this.setState({ name: value })}
                        onSearch={this.onSearchPatient}
                        formItemLayout={smallFormItemLayout}
                        error={errors.name}
                      />

                      <DatePickerFieldGroup
                        label="Date of Birth"
                        name="date_of_birth"
                        value={this.state.date_of_birth}
                        onChange={this.onChangeDateOfBirth}
                        error={errors.date_of_birth}
                        formItemLayout={smallFormItemLayout}
                      />

                      <TextFieldGroup
                        label="Age"
                        name="age"
                        value={this.state.age}
                        error={errors.age}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <RadioGroupFieldGroup
                        label="Sex"
                        name="sex"
                        value={this.state.sex}
                        onChange={this.onChange}
                        error={errors.sex}
                        formItemLayout={smallFormItemLayout}
                        options={gender_options}
                      />

                      <Row className="ant-form-item" gutter={4}>
                        <Col span={8} className="ant-form-item-label">
                          <label>Weight</label>
                        </Col>
                        <Col
                          span={12}
                          className="ant-form-item-control-wrapper"
                        >
                          <Form.Item
                            validateStatus={errors.weight ? "error" : ""}
                            help={errors.weight}
                          >
                            <Input
                              name="weight"
                              value={this.state.weight}
                              onChange={this.onChange}
                              error={errors.weight}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            validateStatus={errors.weight_unit ? "error" : ""}
                            help={errors.weight_unit}
                          >
                            <Select
                              value={this.state.weight_unit}
                              name="weight_unit"
                              onChange={value =>
                                this.setState({ weight_unit: value })
                              }
                            >
                              {weight_unit_options.map((d, index) => (
                                <Option key={d} value={d}>
                                  {d}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <TextAreaGroup
                        label="Address"
                        name="address"
                        value={this.state.address}
                        error={errors.address}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <DatePickerFieldGroup
                        label="Registration Date"
                        name="registration_date"
                        value={this.state.registration_date}
                        onChange={value =>
                          this.setState({ registration_date: value })
                        }
                        error={errors.registration_date}
                        formItemLayout={smallFormItemLayout}
                      />

                      <TextFieldGroup
                        label="Hospital #"
                        name="hospital_number"
                        value={this.state.hospital_number}
                        error={errors.hospital_number}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextFieldGroup
                        label="Ward"
                        name="ward"
                        value={this.state.ward}
                        error={errors.ward}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <SimpleSelectFieldGroup
                        label="Service"
                        name="service"
                        value={this.state.service}
                        onChange={value => this.setState({ service: value })}
                        formItemLayout={smallFormItemLayout}
                        error={errors.service}
                        options={service_options}
                      />
                    </Col>
                  </Row>

                  <Divider orientation="left">Surgical Procedures</Divider>

                  <Row>
                    <Col span={12}>
                      <TextAreaGroup
                        label="Diagnosis"
                        name="diagnosis"
                        value={this.state.diagnosis}
                        error={errors.diagnosis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        rows={5}
                      />

                      <TextAreaGroup
                        label="Procedure"
                        name="procedure"
                        value={this.state.procedure}
                        error={errors.procedure}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        rows={5}
                      />

                      <RadioGroupFieldGroup
                        label="Case"
                        name="case"
                        value={this.state.case}
                        onChange={this.onChangeCase}
                        error={errors.case}
                        formItemLayout={smallFormItemLayout}
                        options={case_options}
                      />

                      <RadioGroupFieldGroup
                        label="Classification"
                        name="classification"
                        value={this.state.classification}
                        onChange={this.onChange}
                        error={errors.classification}
                        formItemLayout={smallFormItemLayout}
                        options={classification_options}
                      />

                      <SelectFieldGroup
                        label="Surgeon"
                        name="surgeon"
                        value={
                          this.state.surgeon && this.state.surgeon.full_name
                        }
                        onChange={index =>
                          this.onSurgeonChange(index, "surgeon")
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />

                      <DateTimePickerFieldGroup
                        label="Date/Time Ordered"
                        name="date_time_ordered"
                        value={this.state.date_time_ordered}
                        onChange={value =>
                          this.setState({ date_time_ordered: value })
                        }
                        error={errors.date_time_ordered}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />
                    </Col>

                    <Col span={12}>
                      <DateTimePickerFieldGroup
                        label="Date/Time Received"
                        name="date_time_received"
                        value={this.state.date_time_received}
                        onChange={value =>
                          this.setState({ date_time_received: value })
                        }
                        error={errors.date_time_received}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      {/* <CheckboxFieldGroup
                        label="Surgery is Date only"
                        name="surgery_is_date"
                        checked={this.state.surgery_is_date}
                        onChange={this.onChange}
                        error={errors.surgery_is_date}
                        formItemLayout={smallFormItemLayout}
                      /> */}

                      {this.state.surgery_is_date ? (
                        <DatePickerFieldGroup
                          label="Date/Time of Surgery"
                          name="date_time_of_surgery"
                          value={this.state.date_time_of_surgery}
                          onChange={value =>
                            this.setState({ date_time_of_surgery: value })
                          }
                          error={errors.date_time_of_surgery}
                          formItemLayout={smallFormItemLayout}
                        />
                      ) : (
                        <DateTimePickerFieldGroup
                          label="Date/Time of Surgery"
                          name="date_time_of_surgery"
                          value={this.state.date_time_of_surgery}
                          onChange={value =>
                            this.setState({ date_time_of_surgery: value })
                          }
                          error={errors.date_time_of_surgery}
                          formItemLayout={smallFormItemLayout}
                          showTime={true}
                        />
                      )}

                      <SimpleSelectFieldGroup
                        label="Case Order"
                        name="case_order"
                        value={this.state.case_order}
                        onChange={value => this.setState({ case_order: value })}
                        formItemLayout={smallFormItemLayout}
                        error={errors.case_order}
                        options={case_order_options}
                      />

                      <SelectFieldGroup
                        label="Received By"
                        name="received_by"
                        value={
                          this.state.received_by &&
                          this.state.received_by.full_name
                        }
                        onChange={index =>
                          this.onNurseChange(index, "received_by")
                        }
                        onSearch={this.onNurseSearch}
                        error={errors.received_by}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.nurses}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <button className="button is-small is-primary">
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
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              <TabPane tab="Pre Operation" key="2">
                <Form
                  onSubmit={e =>
                    this.onSubmit(e, { form: PRE_OPERATION_MODULE })
                  }
                  className="tab-content or-slip-form"
                >
                  <Divider orientation="left">Patient Information</Divider>
                  <Row>
                    <Col span={12}>
                      <TextFieldGroup
                        label="Name"
                        name="name"
                        value={this.state.name}
                        error={errors.name}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <DatePickerFieldGroup
                        label="Date of Birth"
                        name="date_of_birth"
                        value={this.state.date_of_birth}
                        onChange={value =>
                          this.setState({ date_of_birth: value })
                        }
                        error={errors.date_of_birth}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <TextFieldGroup
                        label="Age"
                        name="age"
                        value={this.state.age}
                        error={errors.age}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <RadioGroupFieldGroup
                        label="Sex"
                        name="sex"
                        value={this.state.sex}
                        onChange={this.onChange}
                        error={errors.sex}
                        formItemLayout={smallFormItemLayout}
                        options={gender_options}
                        disabled
                      />

                      <Row className="ant-form-item" gutter={4}>
                        <Col span={8} className="ant-form-item-label">
                          <label>Weight</label>
                        </Col>
                        <Col
                          span={12}
                          className="ant-form-item-control-wrapper"
                        >
                          <Input
                            name="weight"
                            value={this.state.weight}
                            onChange={this.onChange}
                            disabled
                          />
                        </Col>
                        <Col span={4}>
                          <Select
                            value={this.state.weight_unit}
                            name="weight_unit"
                            onChange={value =>
                              this.setState({ weight_unit: value })
                            }
                            disabled
                          >
                            {weight_unit_options.map((d, index) => (
                              <Option key={d} value={d}>
                                {d}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <TextAreaGroup
                        label="Address"
                        name="address"
                        value={this.state.address}
                        error={errors.address}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <DatePickerFieldGroup
                        label="Registration Date"
                        name="registration_date"
                        value={this.state.registration_date}
                        onChange={value =>
                          this.setState({ registration_date: value })
                        }
                        error={errors.registration_date}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <TextFieldGroup
                        label="Hospital #"
                        name="hospital_number"
                        value={this.state.hospital_number}
                        error={errors.hospital_number}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <TextFieldGroup
                        label="Ward"
                        name="ward"
                        value={this.state.ward}
                        error={errors.ward}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <SimpleSelectFieldGroup
                        label="Service"
                        name="service"
                        value={this.state.service}
                        onChange={value => this.setState({ service: value })}
                        formItemLayout={smallFormItemLayout}
                        error={errors.service}
                        options={service_options}
                        disabled
                      />
                    </Col>
                  </Row>

                  <Divider orientation="left">Surgical Procedures</Divider>
                  <Row>
                    <Col span={12}>
                      <TextAreaGroup
                        label="Diagnosis"
                        name="diagnosis"
                        value={this.state.diagnosis}
                        error={errors.diagnosis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        rows={5}
                      />

                      <TextAreaGroup
                        label="Procedure"
                        name="procedure"
                        value={this.state.procedure}
                        error={errors.procedure}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        rows={5}
                      />

                      <SelectFieldGroup
                        label="Surgeon"
                        name="surgeon"
                        value={
                          this.state.surgeon && this.state.surgeon.full_name
                        }
                        onChange={index =>
                          this.onSurgeonChange(index, "surgeon")
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />
                    </Col>
                    <Col span={12}>
                      <RadioGroupFieldGroup
                        label="Operation Type"
                        name="operation_type"
                        value={this.state.operation_type}
                        onChange={this.onChange}
                        error={errors.operation_type}
                        formItemLayout={smallFormItemLayout}
                        options={operation_type_options}
                      />

                      <SimpleSelectFieldGroup
                        label="Status"
                        name="operation_status"
                        value={this.state.operation_status}
                        onChange={value =>
                          this.setState({ operation_status: value })
                        }
                        formItemLayout={smallFormItemLayout}
                        error={errors.operation_status}
                        options={operation_status_options}
                      />

                      <SimpleSelectFieldGroup
                        label="OR Number"
                        name="operating_room_number"
                        value={this.state.operating_room_number}
                        onChange={value =>
                          this.setState({ operating_room_number: value })
                        }
                        formItemLayout={smallFormItemLayout}
                        error={errors.operating_room_number}
                        options={operating_room_number_options}
                      />

                      {this.state.operation_status === ON_RECOVERY && (
                        <SimpleSelectFieldGroup
                          label="Bed No."
                          name="bed_number"
                          value={this.state.bed_number}
                          onChange={value =>
                            this.setState({ bed_number: value })
                          }
                          formItemLayout={smallFormItemLayout}
                          error={errors.bed_number}
                          options={bed_number_options}
                        />
                      )}
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Main Anes"
                        name="main_anes"
                        value={
                          this.state.main_anes && this.state.main_anes.full_name
                        }
                        onChange={this.onAnesChange}
                        onSearch={this.onAnesSearch}
                        error={errors.main_anes}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.anesthesiologists}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <button className="button is-small is-primary">
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
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              <TabPane tab="Post Operation" key="3">
                <Form
                  onSubmit={e =>
                    this.onSubmit(e, { form: POST_OPERATION_MODULE })
                  }
                  className="tab-content or-slip-form"
                >
                  <Divider orientation="left">Patient Information</Divider>
                  <Row>
                    <Col span={12}>
                      <TextFieldGroup
                        label="Name"
                        name="name"
                        value={this.state.name}
                        error={errors.name}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <DatePickerFieldGroup
                        label="Date of Birth"
                        name="date_of_birth"
                        value={this.state.date_of_birth}
                        onChange={value =>
                          this.setState({ date_of_birth: value })
                        }
                        error={errors.date_of_birth}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <TextFieldGroup
                        label="Age"
                        name="age"
                        value={this.state.age}
                        error={errors.age}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <RadioGroupFieldGroup
                        label="Sex"
                        name="sex"
                        value={this.state.sex}
                        onChange={this.onChange}
                        error={errors.sex}
                        formItemLayout={smallFormItemLayout}
                        options={gender_options}
                        disabled
                      />

                      <Row className="ant-form-item" gutter={4}>
                        <Col span={8} className="ant-form-item-label">
                          <label>Weight</label>
                        </Col>
                        <Col
                          span={12}
                          className="ant-form-item-control-wrapper"
                        >
                          <Input
                            name="weight"
                            value={this.state.weight}
                            onChange={this.onChange}
                            disabled
                          />
                        </Col>
                        <Col span={4}>
                          <Select
                            value={this.state.weight_unit}
                            name="weight_unit"
                            onChange={value =>
                              this.setState({ weight_unit: value })
                            }
                            disabled
                          >
                            {weight_unit_options.map((d, index) => (
                              <Option key={d} value={d}>
                                {d}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <TextAreaGroup
                        label="Address"
                        name="address"
                        value={this.state.address}
                        error={errors.address}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <DatePickerFieldGroup
                        label="Registration Date"
                        name="registration_date"
                        value={this.state.registration_date}
                        onChange={value =>
                          this.setState({ registration_date: value })
                        }
                        error={errors.registration_date}
                        formItemLayout={smallFormItemLayout}
                        disabled
                      />

                      <TextFieldGroup
                        label="Hospital #"
                        name="hospital_number"
                        value={this.state.hospital_number}
                        error={errors.hospital_number}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <TextFieldGroup
                        label="Ward"
                        name="ward"
                        value={this.state.ward}
                        error={errors.ward}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        disabled
                      />

                      <SimpleSelectFieldGroup
                        label="Service"
                        name="service"
                        value={this.state.service}
                        onChange={value => this.setState({ service: value })}
                        formItemLayout={smallFormItemLayout}
                        error={errors.service}
                        options={service_options}
                        disabled
                      />
                    </Col>
                  </Row>

                  <Divider orientation="left">Surgical Procedures</Divider>

                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Main Surgeon"
                        name="surgeon"
                        value={
                          this.state.surgeon && this.state.surgeon.full_name
                        }
                        onChange={index =>
                          this.onSurgeonChange(index, "surgeon")
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />

                      <SelectFieldGroup
                        label="Asst. Surgeon"
                        name="assistant_surgeon"
                        value={
                          this.state.assistant_surgeon &&
                          this.state.assistant_surgeon.full_name
                        }
                        onChange={index =>
                          this.onSurgeonChange(index, "assistant_surgeon")
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.assistant_surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Other Surgeon"
                        name="other_surgeon"
                        value={
                          this.state.other_surgeon &&
                          this.state.other_surgeon.full_name
                        }
                        onChange={index =>
                          this.onOtherSurgeonChange(index, "other_surgeon")
                        }
                        onSearch={this.onSurgeonSearch}
                        error={errors.other_surgeon}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.surgeons}
                        column="full_name"
                      />
                      <SelectFieldGroup
                        label="Inst. Nurse"
                        name="instrument_nurse"
                        value={
                          this.state.instrument_nurse &&
                          this.state.instrument_nurse.full_name
                        }
                        onChange={index =>
                          this.onNurseChange(index, "instrument_nurse")
                        }
                        onSearch={this.onNurseSearch}
                        error={errors.instrument_nurse}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.nurses}
                        column="full_name"
                      />
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.other_surgeons}
                        columns={other_surgeons_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Other Inst. Nurse"
                        name="other_inst_nurse"
                        value={
                          this.state.other_inst_nurse &&
                          this.state.other_inst_nurse.full_name
                        }
                        onChange={index =>
                          this.onOtherInstNurseChange(index, "other_inst_nurse")
                        }
                        onSearch={this.onNurseSearch}
                        error={errors.instrument_nurse}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.nurses}
                        column="full_name"
                      />
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.other_inst_nurses}
                        columns={other_inst_nurses_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Sponge Nurse"
                        name="sponge_nurse"
                        value={
                          this.state.sponge_nurse &&
                          this.state.sponge_nurse.full_name
                        }
                        onChange={index =>
                          this.onNurseChange(index, "sponge_nurse")
                        }
                        onSearch={this.onNurseSearch}
                        error={errors.sponge_nurse}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.nurses}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Other Sponge Nurse"
                        name="other_inst_nurse"
                        value={
                          this.state.other_sponge_nurse &&
                          this.state.other_sponge_nurse.full_name
                        }
                        onChange={index =>
                          this.onOtherSpongeNurseChange(
                            index,
                            "other_inst_nurse"
                          )
                        }
                        onSearch={this.onNurseSearch}
                        error={errors.other_sponge_nurse}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.nurses}
                        column="full_name"
                      />
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.other_sponge_nurses}
                        columns={other_sponge_nurses_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Main Anes"
                        name="main_anes"
                        value={
                          this.state.main_anes && this.state.main_anes.full_name
                        }
                        onChange={this.onAnesChange}
                        onSearch={this.onAnesSearch}
                        error={errors.main_anes}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.anesthesiologists}
                        column="full_name"
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SelectFieldGroup
                        label="Other Anes"
                        name="other_anes_input"
                        value={
                          this.state.other_anes_input &&
                          this.state.other_anes_input.full_name
                        }
                        onChange={this.onOtherAnesChange}
                        onSearch={this.onAnesSearch}
                        error={errors.other_anes_input}
                        formItemLayout={smallFormItemLayout}
                        data={this.state.options.anesthesiologists}
                        column="full_name"
                      />
                      <TextFieldGroup
                        label="ASA"
                        name="asa"
                        value={this.state.asa}
                        error={errors.asa}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.other_anes}
                        columns={other_anes_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col span={12}>
                      <SimpleSelectFieldGroup
                        label="Method"
                        name="anes_method"
                        value={this.state.anes_method}
                        onChange={value => {
                          if (value !== "Others") {
                            this.setState({
                              anes_methods: [
                                ...this.state.anes_methods,
                                {
                                  method: value
                                }
                              ]
                            });
                          } else {
                            this.setState({
                              anes_method: value
                            });
                          }
                        }}
                        formItemLayout={smallFormItemLayout}
                        error={errors.anes_method}
                        options={anes_method_options}
                      />

                      {this.state.anes_method === "Others" && (
                        <TextFieldGroup
                          label="Specify"
                          name="anes_method_others"
                          value={this.state.anes_method_others}
                          error={errors.anes_method_others}
                          formItemLayout={smallFormItemLayout}
                          onChange={this.onChange}
                          extra="Press Enter to Add"
                          onPressEnter={e => {
                            e.preventDefault();
                            this.setState({
                              anes_methods: [
                                ...this.state.anes_methods,
                                {
                                  method: this.state.anes_method_others
                                }
                              ],
                              anes_method_others: "",
                              anes_method: ""
                            });
                          }}
                        />
                      )}

                      <DateTimePickerFieldGroup
                        label="Anesthesia Started"
                        name="anes_start"
                        value={this.state.anes_start}
                        onChange={value => this.setState({ anes_start: value })}
                        error={errors.anes_start}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Operation Started"
                        name="operation_started"
                        value={this.state.operation_started}
                        onChange={value =>
                          this.setState({ operation_started: value })
                        }
                        error={errors.operation_started}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Operation Finished"
                        name="operation_finished"
                        value={this.state.operation_finished}
                        onChange={value =>
                          this.setState({ operation_finished: value })
                        }
                        error={errors.operation_finished}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <TextAreaGroup
                        label="Tentative Diagnosis"
                        name="tentative_diagnosis"
                        value={this.state.tentative_diagnosis}
                        error={errors.tentative_diagnosis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Final Diagnosis"
                        name="final_diagnosis"
                        value={this.state.final_diagnosis}
                        error={errors.final_diagnosis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.anes_methods}
                        columns={anes_methods_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>

                  <Divider orientation="left">Anesthetics</Divider>
                  <Row gutter={12}>
                    <Col span={12}>
                      <TextFieldGroup
                        label="Anesthetic Used"
                        name="anes_used"
                        value={this.state.anes_used}
                        error={errors.anes_used}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        inputRef={this.anes_used_input}
                        onPressEnter={e => {
                          e.preventDefault();
                          this.anes_quantity_input.current.focus();
                        }}
                      />
                      <TextFieldGroup
                        label="Quantity"
                        name="anes_quantity"
                        value={this.state.anes_quantity}
                        error={errors.anes_quantity}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        inputRef={this.anes_quantity_input}
                        onPressEnter={e => {
                          e.preventDefault();
                          this.anes_quantity_unit_input.current.focus();
                        }}
                      />

                      <SimpleSelectFieldGroup
                        label="Unit"
                        name="anes_quantity_unit"
                        value={this.state.anes_quantity_unit}
                        onChange={value =>
                          this.setState({ anes_quantity_unit: value })
                        }
                        formItemLayout={smallFormItemLayout}
                        error={errors.anes_quantity_unit}
                        options={anes_unit_options}
                        inputRef={this.anes_quantity_unit_input}
                      />

                      <SimpleSelectFieldGroup
                        label="Route"
                        name="anes_route"
                        value={this.state.anes_route}
                        onChange={value => this.setState({ anes_route: value })}
                        formItemLayout={smallFormItemLayout}
                        error={errors.anes_route}
                        options={anes_route_options}
                      />

                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <Button
                              className="button is-small"
                              onClick={this.onAddAnesthetic}
                            >
                              Add Anesthetic
                            </Button>
                          </div>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.anesthetics}
                        columns={anesthetics_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>

                  <Divider orientation="left">RVU</Divider>
                  <Row gutter={12}>
                    <Col span={12}>
                      <TextFieldGroup
                        label="RVU Code"
                        name="rvs_code"
                        value={this.state.rvs_code}
                        error={errors.rvs_code}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                        onPressEnter={this.onRvsCodeLookup}
                      />

                      <TextAreaAutocompleteGroup
                        label="RVU Desc"
                        name="rvs_description"
                        value={this.state.rvs_description}
                        error={errors.rvs_description}
                        formItemLayout={smallFormItemLayout}
                        rows="4"
                        onChange={value =>
                          this.setState({ rvs_description: value })
                        }
                        dataSource={rvs_desc_data_source}
                        onSelect={this.onRvsSelect}
                        onSearch={this.onRvsSearch}
                      />

                      <RadioGroupFieldGroup
                        label="Laterality"
                        name="rvs_laterality"
                        value={this.state.rvs_laterality}
                        onChange={this.onChange}
                        error={errors.rvs_laterality}
                        formItemLayout={smallFormItemLayout}
                        options={laterality_options}
                      />

                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <Button
                              className="button is-small"
                              onClick={this.onAddRvs}
                            >
                              Add RVU
                            </Button>
                          </div>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Table
                        dataSource={this.state.rvs}
                        columns={rvs_column}
                        rowKey={record => record._id}
                        locale={{ emptyText: "No Records Found" }}
                        pagination={false}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      <Divider orientation="left">
                        Treatment in the Operating Room
                      </Divider>

                      <TextAreaGroup
                        label="Before Operation"
                        name="before_operation"
                        value={this.state.before_operation}
                        error={errors.before_operation}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="During Operation"
                        name="during_operation"
                        value={this.state.during_operation}
                        error={errors.during_operation}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="After Operation"
                        name="after_operation"
                        value={this.state.after_operation}
                        error={errors.after_operation}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Comp. during oper"
                        name="complications_during_operation"
                        value={this.state.complications_during_operation}
                        error={errors.complications_during_operation}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Comp. after oper"
                        name="complications_after_operation"
                        value={this.state.complications_after_operation}
                        error={errors.complications_after_operation}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      {/* <Divider orientation="left">Operation Performed</Divider>

                      <TextAreaGroup
                        label="Operation Performed"
                        name="operation_performed"
                        value={this.state.operation_performed}
                        error={errors.operation_performed}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      /> */}
                    </Col>
                    <Col span={12}>
                      <Divider orientation="left">
                        Immediate Post Operative Treatment
                      </Divider>

                      <TextAreaGroup
                        label="Position in Bed"
                        name="position_in_bed"
                        value={this.state.position_in_bed}
                        error={errors.position_in_bed}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Proctoclysis"
                        name="proctoclysis"
                        value={this.state.proctoclysis}
                        error={errors.proctoclysis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Hypodermoclysis"
                        name="hypodermoclysis"
                        value={this.state.hypodermoclysis}
                        error={errors.hypodermoclysis}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Nutrition"
                        name="nutrition"
                        value={this.state.nutrition}
                        error={errors.nutrition}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />

                      <TextAreaGroup
                        label="Stimulant and other med."
                        name="stimulant"
                        value={this.state.stimulant}
                        error={errors.stimulant}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <button className="button is-small is-primary">
                              Save
                            </button>
                          </div>

                          {!isEmpty(this.state._id) && [
                            <div className="control">
                              <Link
                                to={`/or-slip/${this.state._id}/surgical-memorandum`}
                                target="_blank"
                              >
                                <Button className="button is-small is-outlined is-info">
                                  <span className="icon is-small">
                                    <i className="fas fa-print" />
                                  </span>
                                  Print Surgical Memo
                                </Button>
                              </Link>
                            </div>,
                            false && (
                              <div className="control">
                                <Link
                                  to={`/or-slip/${this.state._id}/operative-technique`}
                                  target="_blank"
                                >
                                  <Button className="button is-small is-outlined is-info">
                                    <span className="icon is-small">
                                      <i className="fas fa-print" />
                                    </span>
                                    Print OB Operative Technique
                                  </Button>
                                </Link>
                              </div>
                            ),
                            <a
                              className="button is-danger is-outlined is-small control"
                              onClick={this.onDelete}
                            >
                              <span>Delete</span>
                              <span className="icon is-small">
                                <i className="fas fa-times" />
                              </span>
                            </a>
                          ]}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              <TabPane tab="Time Logs" key="4">
                <Form
                  onSubmit={e => this.onSubmit(e, { form: TIME_LOGS_MODULE })}
                  className="tab-content or-slip-form"
                >
                  <Row>
                    <Col span={12}>
                      <DateTimePickerFieldGroup
                        label="Time Ward Informed"
                        name="time_ward_informed"
                        value={this.state.time_ward_informed}
                        onChange={value =>
                          this.setState({ time_ward_informed: value })
                        }
                        error={errors.time_ward_informed}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Arrival Time"
                        name="arrival_time"
                        value={this.state.arrival_time}
                        onChange={value =>
                          this.setState({ arrival_time: value })
                        }
                        error={errors.arrival_time}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Room is Ready"
                        name="room_is_ready"
                        value={this.state.room_is_ready}
                        onChange={value =>
                          this.setState({ room_is_ready: value })
                        }
                        error={errors.room_is_ready}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Equip/Inst ready"
                        name="equip_ready"
                        value={this.state.equip_ready}
                        onChange={value =>
                          this.setState({ equip_ready: value })
                        }
                        error={errors.equip_ready}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Patient Placed in OR Table"
                        name="patient_placed_in_or_table"
                        value={this.state.patient_placed_in_or_table}
                        onChange={value =>
                          this.setState({ patient_placed_in_or_table: value })
                        }
                        error={errors.patient_placed_in_or_table}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Time Anes Arrived"
                        name="time_anes_arrived"
                        value={this.state.time_anes_arrived}
                        onChange={value =>
                          this.setState({ time_anes_arrived: value })
                        }
                        error={errors.time_anes_arrived}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />
                    </Col>
                    <Col span={12}>
                      <DateTimePickerFieldGroup
                        label="Time Surgeon Arrived"
                        name="time_surgeon_arrived"
                        value={this.state.time_surgeon_arrived}
                        onChange={value =>
                          this.setState({ time_surgeon_arrived: value })
                        }
                        error={errors.time_surgeon_arrived}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Induction Time"
                        name="induction_time"
                        value={this.state.induction_time}
                        onChange={value =>
                          this.setState({ induction_time: value })
                        }
                        error={errors.induction_time}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Induction Completed"
                        name="induction_completed"
                        value={this.state.induction_completed}
                        onChange={value =>
                          this.setState({ induction_completed: value })
                        }
                        error={errors.induction_completed}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Time OR Started"
                        name="time_or_started"
                        value={this.state.time_or_started}
                        onChange={value =>
                          this.setState({ time_or_started: value })
                        }
                        error={errors.time_or_started}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="OR Ended"
                        name="or_ended"
                        value={this.state.or_ended}
                        onChange={value => this.setState({ or_ended: value })}
                        error={errors.or_ended}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <DateTimePickerFieldGroup
                        label="Trans out from OR"
                        name="trans_out_from_or"
                        value={this.state.trans_out_from_or}
                        onChange={value =>
                          this.setState({ trans_out_from_or: value })
                        }
                        error={errors.trans_out_from_or}
                        formItemLayout={smallFormItemLayout}
                        showTime={true}
                      />

                      <CheckboxFieldGroup
                        label="Surgical Safety Checklist"
                        name="surgical_safety_checklist"
                        checked={this.state.surgical_safety_checklist}
                        onChange={this.onChange}
                        error={errors.surgical_safety_checklist}
                        formItemLayout={smallFormItemLayout}
                      />

                      <TextAreaGroup
                        label="Remarks"
                        name="remarks"
                        value={this.state.remarks}
                        error={errors.remarks}
                        formItemLayout={smallFormItemLayout}
                        onChange={this.onChange}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Form.Item className="m-t-1" {...smallTailFormItemLayout}>
                        <div className="field is-grouped">
                          <div className="control">
                            <button className="button is-small is-primary">
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
                    </Col>
                  </Row>
                </Form>
              </TabPane>
            </Tabs>
          ) : (
            <div>
              <div className="m-b-1 ">
                {this.state.selected_row_keys.length > 0 && (
                  <Button
                    type="danger"
                    icon="delete"
                    size="small"
                    onClick={this.onDeleteSelection}
                  >
                    {" "}
                    Delete
                  </Button>
                )}
              </div>
              <Table
                className="or-slip-table"
                dataSource={this.state[collection_name]}
                columns={records_column}
                rowKey={record => record._id}
                pagination={{
                  current: this.state.current_page,
                  defaultCurrent: this.state.current_page,
                  onChange: this.onChangePage
                }}
                rowSelection={rowSelection}
              />
            </div>
          )}
        </div>
      </Content>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth,
    map: state.map
  };
};

export default connect(mapToState)(withRouter(OperatingRoomSlipForm));
