import React, { Component } from "react";
import { connect } from "react-redux";
import {withRouter} from 'react-router-dom'
import sitemap from "./../../images/site-map.jpg";
import classnames from "classnames";
import { Layout} from "antd";
import { setCurrentLot } from './../../actions/mapActions'
import axios from 'axios'

const { Content } = Layout;

const form_data = {
  path_occupied : [],
  path_vacant : [],
  errors: {}
};


class SiteMap extends Component {
  state = {
    title: "Site Map",
    
    sound_options: [],
    ...form_data
  };

  constructor(props) {
    super(props)
  }

  componentDidMount() {

    if ( this.props.selectedLots ) {
      const path_occupied = [
        ...this.state.path_occupied,
        ...this.props.selectedLots
      ]
      this.setState({path_occupied})
    } else {
      axios.post('/api/lots/lot-status')
        .then(response => {
          const vacant_lots = response.data.vacant_lots.map(o => o.lot)
          const occupied_lots = response.data.occupied_lots.map(o => o.lot)

          this.setState({
            path_occupied : [
              ...occupied_lots
            ],
            path_vacant : [
              ...vacant_lots
            ]
          })
        })
    }

    
    
  }  

  onPathSelect = (event) => {
    
    if ( this.props.isReadOnly ) {
      return;
    }

    /* const is_selected = this.state.path_occupied.includes(event.target.id);

    if ( is_selected ) {
      const path_occupied = [...this.state.path_occupied]
      remove(path_occupied, (o) => o === event.target.id )
      this.setState({
        path_occupied
      })
    } else {
      this.setState({
        path_occupied : [
          ...this.state.path_occupied,
          event.target.id
        ]
      })
    } */

    this.props.setCurrentLot({ lot : event.target.id, history : this.props.history});
    
  }

  classLotStatus = (lot) => {
    return {
      'is-occupied' : this.state.path_occupied.includes(lot),
      'is-vacant' : this.state.path_vacant.includes(lot)
    }
  }

  render() {

    return (
      <Content
        style={{
          background: "#fff",
          padding: 24
        }}
        className="is-full-height"
      >
        <div className="columns is-full-height">
          <div className="column is-full-height has-text-centered">
            <div
              className="img-overlay-wrap is-full-height"
              style={{
                backgroundImage: `url(${sitemap})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top left",
                backgroundSize: "100%",
                width: "70%"
              }}
            >
              <svg x="0px" y="0px" viewBox="0 0 1190.88 841.92">
              <g id="Layer_2" data-name="Layer 2" onClick={this.onPathSelect}>
                <path id='p1' className={classnames('cls-3 '  , this.classLotStatus('p1')
                )} d="M110.41,541.42c-.33.22-2.77,2.55-2.77,2.55v24.49l2.77,2.55h25.17V541.42Z"/>
                <rect id='p2' className={classnames('cls-3', this.classLotStatus('p2')
                )} x="135.58" y="541.42" width="18.18" height="29.6"/>
                <rect id='p3' className={classnames('cls-3', this.classLotStatus('p3')
                )} x="153.76" y="541.42" width="18.29" height="29.6"/>
                <rect id='p4' className={classnames('cls-3', this.classLotStatus('p4')
                )} x="172.05" y="541.42" width="18.29" height="29.6"/>
                <rect id='p5' className={classnames('cls-3', this.classLotStatus('p5')
                )} x="190.34" y="541.42" width="18.07" height="29.6"/>
                <rect id='p6' className={classnames('cls-3', this.classLotStatus('p6')
                )} x="208.4" y="541.42" width="18.07" height="29.6"/>
                <rect id='p7' className={classnames('cls-3', this.classLotStatus('p7')
                )} x="226.47" y="541.42" width="18.4" height="29.6"/>
                <rect id='p8' className={classnames('cls-3', this.classLotStatus('p8')
                )} x="244.87" y="541.42" width="17.96" height="29.6"/>
                <rect id='p9' className={classnames('cls-3', this.classLotStatus('p9')
                )} x="262.83" y="541.42" width="18.4" height="29.6"/>
                <rect id='p10' className={classnames('cls-3', this.classLotStatus('p10')
                )} x="281.23" y="541.42" width="17.96" height="29.6"/>
                <rect id='p11' className={classnames('cls-3', this.classLotStatus('p11')
                )} x="299.19" y="541.42" width="18.07" height="29.6"/>
                <rect id='p12' className={classnames('cls-3', this.classLotStatus('p12')
                )} x="317.25" y="541.42" width="18.51" height="29.6"/>
                <rect id='p13' className={classnames('cls-3', this.classLotStatus('p13')
                )} x="335.77" y="541.42" width="17.85" height="29.6"/>
                <rect id='p14' className={classnames('cls-3', this.classLotStatus('p14')
                )} x="353.61" y="541.42" width="18.07" height="29.6"/>
                <polygon id='p15' className={classnames('cls-3', this.classLotStatus('p15')
                )} points="403.94 541.42 371.68 541.42 371.68 571.01 391.08 571.01 395.4 568.13 406.04 545.3 403.94 541.42"/>
                <polygon id='p16' className={classnames('cls-3', this.classLotStatus('p16')
                )} points="107.64 592.18 110.53 589.08 133.91 589.08 133.91 618.57 107.64 618.57 107.64 592.18"/>
                <rect id='p17' className={classnames('cls-3', this.classLotStatus('p17')
                )} x="152.09" y="589.08" width="18.4" height="29.49"/>
                <rect id='p18' className={classnames('cls-3', this.classLotStatus('p18')
                )} x="170.49" y="589.08" width="18.07" height="29.49"/>
                <rect id='p19' className={classnames('cls-3', this.classLotStatus('p19')
                )} x="188.56" y="589.08" width="18.07" height="29.49"/>
                <rect id='p20' className={classnames('cls-3', this.classLotStatus('p20')
                )} x="206.63" y="589.08" width="18.18" height="29.49"/>
                <rect id='p21' className={classnames('cls-3', this.classLotStatus('p21')
                )} x="224.81" y="589.08" width="18.29" height="29.49"/>
                <polygon id='p22' className={classnames('cls-3', this.classLotStatus('p22')
                )} points="260.94 589.08 243.1 589.08 243.1 618.57 261.17 618.57 260.94 589.08"/>
                <polygon id='p23' className={classnames('cls-3', this.classLotStatus('p23')
                )} points="279.29 589.08 260.94 589.08 261.17 618.57 279.51 618.57 279.29 589.08"/>
                <polygon id='p24' className={classnames('cls-3', this.classLotStatus('p24')
                )} points="297.58 589.08 279.29 589.08 279.51 618.57 297.58 618.57 297.58 589.08"/>
                <rect id='p25' className={classnames('cls-3', this.classLotStatus('p25')
                )} x="297.58" y="589.08" width="18.12" height="29.49"/>
                <rect id='p26' className={classnames('cls-3', this.classLotStatus('p26')
                )} x="315.7" y="589.08" width="18.23" height="29.49"/>
                <path id='p27' className={classnames('cls-3', this.classLotStatus('p27')
                )} d="M352.06,589.08H333.94v29.49s18.07.44,18.12,0S352.06,589.08,352.06,589.08Z"/>
                <polygon id='p28' className={classnames('cls-3', this.classLotStatus('p28')
                )} points="381.16 589.08 352.06 589.08 352.06 618.57 373.01 618.57 374.01 613.3 383.54 592.91 381.16 589.08"/>
                <path id='p29' className={classnames('cls-3', this.classLotStatus('p29')
                )} d="M107.64,618.57v26.82l2.74,2.63s21.4.1,21.45,0,0-29.45,0-29.45Z"/>
                <polygon id='p30' className={classnames('cls-3', this.classLotStatus('p30')
                )} points="149.99 648.06 131.83 648.02 131.83 618.57 149.99 618.57 149.99 648.06"/>
                <rect id='p31' className={classnames('cls-3', this.classLotStatus('p31')
                )} x="149.99" y="618.57" width="18.16" height="29.49"/>
                <rect id='p32' className={classnames('cls-3', this.classLotStatus('p32')
                )} x="168.14" y="618.57" width="18.16" height="29.49"/>
                <rect id='p33' className={classnames('cls-3', this.classLotStatus('p33')
                )} x="186.3" y="618.57" width="18.11" height="29.49"/>
                <rect id='p34' className={classnames('cls-3', this.classLotStatus('p34')
                )} x="204.4" y="618.57" width="18.21" height="29.49"/>
                <rect id='p35' className={classnames('cls-3', this.classLotStatus('p35')
                )} x="222.61" y="618.57" width="18.11" height="29.49"/>
                <rect id='p36' className={classnames('cls-3', this.classLotStatus('p36')
                )} x="240.72" y="618.57" width="18.16" height="29.49"/>
                <rect id='p37' className={classnames('cls-3', this.classLotStatus('p37')
                )} x="258.87" y="618.57" width="18.21" height="29.49"/>
                <rect id='p38' className={classnames('cls-3', this.classLotStatus('p38')
                )} x="277.08" y="618.57" width="18.21" height="29.49"/>
                <rect id='p39' className={classnames('cls-3', this.classLotStatus('p39')
                )} x="295.29" y="618.57" width="18.21" height="29.49"/>
                <polygon id='p40' className={classnames('cls-3', this.classLotStatus('p40')
                )} points="331.65 648.06 313.49 648.06 313.49 618.57 331.65 618.76 331.65 648.06"/>
                <polygon id='p41' className={classnames('cls-3', this.classLotStatus('p41')
                )} points="349.71 648.06 331.65 648.06 331.65 618.76 349.71 618.75 349.71 648.06"/>
                <polygon id='p42' className={classnames('cls-3', this.classLotStatus('p42')
                )} points="364.72 648.06 349.71 648.06 349.71 618.75 373.01 618.57 368.26 645.17 364.72 648.06"/>
                <polygon id='p43' className={classnames('cls-3', this.classLotStatus('p43')
                )} points="84.47 483.45 50.04 532.65 84.47 532.65 84.47 483.45"/>
                <polygon id='p44' className={classnames('cls-3', this.classLotStatus('p44')
                )} points="45.9 551.21 50.04 532.65 84.47 532.65 84.47 551.21 45.9 551.21"/>
                <polygon id='p45' className={classnames('cls-3', this.classLotStatus('p45')
                )} points="42.37 569.25 45.9 551.21 84.47 551.21 84.47 569.25 42.37 569.25"/>
                <polygon id='p46' className={classnames('cls-3', this.classLotStatus('p46')
                )} points="41.38 587.41 42.37 569.25 84.47 569.25 84.47 587.41 41.38 587.41"/>
                <polygon id='p47' className={classnames('cls-3', this.classLotStatus('p47')
                )} points="40.07 605.65 41.38 587.41 84.47 587.41 84.47 605.65 40.07 605.65"/>
                <polygon id='p48' className={classnames('cls-3', this.classLotStatus('p48')
                )} points="38.95 623.82 40.07 605.65 84.47 605.65 84.47 623.82 38.95 623.82"/>

                <polygon id='p49' className={classnames('cls-3', this.classLotStatus('p49')
                )} points="35.87 655.69 37.71 641.99 84.47 641.99 84.47 660.22 40.73 660.22 35.87 655.69"/>
                <polygon id='p50' className={classnames('cls-3', this.classLotStatus('p50')
                )} points="123.94 666.4 122.77 670.51 137.6 684.44 158.4 689.89 158.4 666.4 123.94 666.4"/>
                <polygon id='p51' className={classnames('cls-3', this.classLotStatus('p51')
                )} points="181.35 666.4 158.4 666.4 158.4 689.89 181.35 695.69 181.35 666.4"/>
                <polygon id='p52' className={classnames('cls-3', this.classLotStatus('p52')
                )} points="201.71 666.4 181.35 666.4 181.35 695.69 201.71 700.6 201.71 666.4"/>

                <polygon id='p53' className={classnames('cls-3', this.classLotStatus('p53')
                )} points="233.31 708.55 233.31 685.15 201.71 685.15 201.71 700.6 233.31 708.55"/>
                <polygon id='p54' className={classnames('cls-3', this.classLotStatus('p54')
                )} points="258.87 714.98 233.31 708.55 233.31 688.73 258.58 688.73 258.87 714.98"/>
                <polygon id='p55' className={classnames('cls-3', this.classLotStatus('p55')
                )} points="258.49 666.4 233.31 666.4 233.31 688.73 258.58 688.73 258.49 666.4"/>
                <polygon id='p56' className={classnames('cls-3', this.classLotStatus('p56')
                )} points="281.53 666.4 258.49 666.4 258.58 688.73 281.53 688.73 281.53 666.4"/>
                <polygon id='p57' className={classnames('cls-3', this.classLotStatus('p57')
                )} points="281.53 720.78 281.53 688.73 258.58 688.73 258.87 714.98 281.53 720.78"/>
                <rect id='p58' className={classnames('cls-3', this.classLotStatus('p58')
                )} x="281.53" y="693.37" width="20" height="27.41"/>
                <rect id='p59' className={classnames('cls-3', this.classLotStatus('p59')
                )} x="301.53" y="693.37" width="20.45" height="27.41"/>
                <polygon id='p60' className={classnames('cls-3', this.classLotStatus('p60')
                )} points="359.12 693.37 321.98 693.37 321.98 720.78 348.23 720.78 355.1 714.98 359.12 693.37"/>
                <rect id='p61' className={classnames('cls-3', this.classLotStatus('p61')
                )} x="281.53" y="666.4" width="20" height="26.97"/>
                <rect id='p62' className={classnames('cls-3', this.classLotStatus('p62')
                )} x="301.53" y="666.4" width="20.45" height="26.97"/>
                <polygon id='p63' className={classnames('cls-3', this.classLotStatus('p63')
                )} points="342.87 666.4 321.98 666.4 321.98 693.37 342.87 693.01 342.87 666.4"/>
                <polygon id='p64' className={classnames('cls-3', this.classLotStatus('p64')
                )} points="360.64 666.4 342.87 666.4 342.87 693.01 359.12 693.37 363.76 669.88 360.64 666.4"/>
                <polygon id='p65' className={classnames('cls-3', this.classLotStatus('p65')
                )} points="111.29 685.15 107.2 686.93 107.2 721.36 114 727.81 130.55 732.25 138.05 702.97 129.07 701.23 111.29 685.15"/>
                <polygon id='p66' className={classnames('cls-3', this.classLotStatus('p66')
                )} points="155.48 707.68 138.05 702.97 130.55 732.25 148.16 736.61 155.48 707.68"/>
                <polygon id='p67' className={classnames('cls-3', this.classLotStatus('p67')
                )} points="173.08 712.12 155.48 707.68 148.16 736.61 165.85 740.97 173.08 712.12"/>
                <polygon id='p68' className={classnames('cls-3', this.classLotStatus('p68')
                )} points="190.6 716.83 173.08 712.12 165.85 740.97 183.54 745.67 190.6 716.83"/>
                <polygon id='p69' className={classnames('cls-3', this.classLotStatus('p69')
                )} points="208.38 721.27 190.6 716.83 183.54 745.67 201.14 749.94 208.38 721.27"/>
                <polygon id='p70' className={classnames('cls-3', this.classLotStatus('p70')
                )} points="226.16 725.72 208.38 721.27 201.14 749.94 218.57 754.39 226.16 725.72"/>
                <polygon id='p71' className={classnames('cls-3', this.classLotStatus('p71')
                )} points="243.24 729.99 226.16 725.72 218.57 754.39 236.18 758.75 243.24 729.99"/>
                <polygon id='p72' className={classnames('cls-3', this.classLotStatus('p72')
                )} points="261.19 734.34 243.24 729.99 236.18 758.75 253.87 763.02 261.19 734.34"/>
                <polygon id='p73' className={classnames('cls-3', this.classLotStatus('p73')
                )} points="278.88 738.7 261.19 734.34 253.87 763.02 271.3 767.63 278.88 738.7"/>
                <polygon id='p74' className={classnames('cls-3', this.classLotStatus('p74')
                )} points="298.66 738.88 278.88 738.7 271.3 767.63 298.66 774.35 298.66 738.88"/>
                <polygon id='p75' className={classnames('cls-3', this.classLotStatus('p75')
                )} points="316.79 738.7 298.66 738.88 298.66 774.35 316.79 778.88 316.79 738.7"/>
                <polygon id='p76' className={classnames('cls-3', this.classLotStatus('p76')
                )} points="335.18 738.7 316.79 738.7 316.79 778.88 331.17 782.8 335.18 780.62 335.18 738.7"/>
                <polygon id='p77' className={classnames('cls-3', this.classLotStatus('p77')
                )} points="354.7 738.7 335.18 738.7 335.18 780.62 367.25 765.63 354.7 738.7"/>
                <polygon id='p78' className={classnames('cls-3', this.classLotStatus('p78')
                )} points="370.04 731.64 354.7 738.7 367.25 765.63 396.44 752.56 399.58 736.96 370.04 731.64"/>
                <polygon id='p79' className={classnames('cls-3', this.classLotStatus('p79')
                )} points="373.79 713.69 370.04 731.64 399.58 736.96 402.98 719.18 373.79 713.69"/>
                <polygon id='p80' className={classnames('cls-3', this.classLotStatus('p80')
                )} points="377.14 695.91 373.79 713.69 402.98 719.18 406.47 701.49 377.14 695.91"/>
                <polygon id='p81' className={classnames('cls-3', this.classLotStatus('p81')
                )} points="380.5 678.05 377.14 695.91 406.47 701.49 409.43 683.54 380.5 678.05"/>
                <polygon id='p82' className={classnames('cls-3', this.classLotStatus('p82')
                )} points="383.54 660.18 380.5 678.05 409.43 683.54 412.83 665.41 383.54 660.18"/>
                <polygon id='p83' className={classnames('cls-3', this.classLotStatus('p83')
                )} points="387.03 642.23 383.54 660.18 412.83 665.41 416.4 647.63 387.03 642.23"/>
                <path id='p84' className={classnames('cls-3', this.classLotStatus('p84')
                )} d="M391.22,618.76,387,642.23s29.46,6.45,29.37,5.4,3.66-19.43,3.66-19.43Z"/>
                <polygon id='p85' className={classnames('cls-3', this.classLotStatus('p85')
                )} points="400.98 598.91 391.21 618.76 420.06 628.2 427.56 611.9 400.98 598.91"/>
                <polygon id='p86' className={classnames('cls-3', this.classLotStatus('p86')
                )} points="408.82 582.44 400.98 598.91 427.56 611.9 435.57 595.17 408.82 582.44"/>
                <polygon id='p87' className={classnames('cls-3', this.classLotStatus('p87')
                )} points="416.49 566.23 408.82 582.44 435.57 595.17 443.5 578.61 416.49 566.23"/>
                <polygon id='p88' className={classnames('cls-3', this.classLotStatus('p88')
                )} points="423.98 549.76 416.49 566.23 443.5 578.61 451 562.14 423.98 549.76"/>
                <path id='p89' className={classnames('cls-3', this.classLotStatus('p89')
                )} d="M490,541.42H430.43a12,12,0,0,0-6.45,8.34l27,12.38,5.58-12.38Z"/>
                <rect id='p90' className={classnames('cls-3', this.classLotStatus('p90')
                )} x="133.91" y="589.08" width="18.18" height="29.49"/>
                <path id='p91' className={classnames('cls-3', this.classLotStatus('p91')
                )} d="M37.71,642c.06-.2,1.24-18.17,1.24-18.17H84.47V642Z"/>
                <path id='p92' className={classnames('cls-3', this.classLotStatus('p92')
                )} d="M84.47,700.23c.07-.85,0-40,0-40H40.73Z"/>
                <rect id='p93' className={classnames('cls-3', this.classLotStatus('p93')
                )} x="201.7" y="666.4" width="31.61" height="18.75"/>
              </g>
              </svg>
            </div>
          </div>
        </div>
      </Content>
    );
  }
}

const mapToState = state => {
  return {
    auth: state.auth,
    map : state.map
  };
};

export default connect(mapToState, {
  setCurrentLot
})(withRouter(SiteMap));
