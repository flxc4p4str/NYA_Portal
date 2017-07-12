import { ElementOverlayDirective } from './../../elementOverlay.directive';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../data.service';
import { GlobalState } from '../../global.state';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { ABSFunctions } from '../../abs.functions';
import { ABSDataURI } from './../../abs.dataUri';

import { BaThemePreloader, BaThemeSpinner } from '../../theme/services';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

@Component({
  selector: 'nga-logistics',
  styleUrls: ['./logistics.scss'],
  templateUrl: './logistics.html',
})
export class LogisticsComponent implements OnInit {

  @ViewChild('chartContainer')
  chartContainer: ElementRef;

  @ViewChild('portListContainer')
  portListContainer: ElementRef;

  private xAxis: any;
  private yAxis: any;
  private radius: any;
  private color: any;
  private margin: any;
  private width: any;
  private height: any;
  private svg: any;
  private innerSvg: any;
  private xScale: any;
  private yScale: any;
  private data;
  private dataP;
  private dataS;
  private poGroup: any;
  private shipGroup: any;
  private zoom: any;
  private legend;
  private gX: any;
  private gY: any;
  private selectedItem;
  private view: any;
  private g: any;
  private group: any;
  private portVendors: any[];
  private portShipments: any[];
  private shipmentDetails: any[];

  chartData: any[];
  chartDataFilter: any[];
  errorMessage: any;

  showGridLines: boolean = true;

  constructor(private absFunctions: ABSFunctions, private _dataService: DataService
    , private _spinner: BaThemeSpinner, private _state: GlobalState
    , private dataUri: ABSDataURI, private _msg: ToastyService) {

    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      // console.log('Menu Collapsed',isCollapsed);
      this.resizeChart(isCollapsed);
    });
  }
  ngOnInit() {
    this._spinner.show();

    BaThemePreloader.registerLoader(this._loadData());

  }
  private _loadData(): Promise<any> {
    return new Promise((resolve, reject) => {

      this._dataService.shipmentsAndOpenPOs()
        .subscribe(
        x => {
          if (x) {

            for (const pod of x.chartData) {
              const vesselClass = (pod.type === 'S') ? pod.vessel.split(' ').join('_') : '';
              pod.vesselClass = vesselClass;
            }
            this.chartData = x.chartData; 
            this.chartDataFilter = _.orderBy(x.chartDataFilter, ['portCodeOrig', 'whseCode']);
            this.shipmentDetails = x.shipmentDetails;
            if (this.chartDataFilter.length) {
              this.selectedItem = this.chartDataFilter[0];
              this.drawChart();
            } else {
              this.selectedItem = null;
            }
          } else {
            this.data = null;
          }
        },
        error => this.errorMessage = <any>error);
    });
  }

  download_png() {
    const that = this;
    this.absFunctions.exportToPng({
      selector: '#chart',
      legendData: this.selectedItem.portVendors,
      fileName: '3PLForecast.png',
    }).then(function (result) {
      that.downloadComplete(result);
    });
  }
  downloadComplete(msg) {
    this._msg.success(msg);
  }
  drawChart() {

    this.data = this.chartData.filter(d =>
      d.portCodeOrig === this.selectedItem.portCodeOrig
      && d.whseCode === this.selectedItem.whseCode);
    const that = this; 
    const containerWidth = this.chartContainer.nativeElement.offsetWidth;
    const containerHeight = this.chartContainer.nativeElement.offsetheight;
    const windowAR = window.screen.height / window.screen.width;
    this.margin = { top: 30, right: 60, bottom: 60, left: 70 };
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = (this.width * windowAR) - this.margin.top - this.margin.bottom;
    const cHeight = this.height + this.margin.top + this.margin.bottom;
    const cWidth = this.width + this.margin.left + this.margin.right;
    const dateNow = Date.now() - 0 * 24 * 60 * 60 * 1000; // 0 days ago
    const minX = dateNow;
    const dateNow2 = Date.now() + 180 * 24 * 60 * 60 * 1000; // 6 months ahead
    const maxX = dateNow2; 

    d3.select('#OuterSVG').remove();

    const zoomed = function () {
      that.g.attr('transform', d3.event.transform);
      that.gX.call(that.xAxis.scale(d3.event.transform.rescaleX(that.xScale)));
      that.gY.call(that.yAxis.scale(d3.event.transform.rescaleY(that.yScale)));
      that.applyGridStyles(that.showGridLines);
    };

    this.zoom = d3.zoom()
      .scaleExtent([1 / 2, 10])
      .translateExtent([[-100, -100], [this.width + 90, this.height + 100]])
      .on('zoom', zoomed);

    this.svg = d3.select('#chart')
      .append('svg')
      .attr('id', 'OuterSVG')
      .attr('width', '100%')
      .attr('height', cHeight)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', `0 0 ${cWidth} ${cHeight}`)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.xScale = d3.scaleTime()
      .range([0, this.width])
      .domain([minX, maxX]).nice()
      .clamp(true);

    this.yScale = d3.scaleLog()
      .range([this.height, 0]);

    this.xAxis = d3.axisBottom()
      .scale(this.xScale)
      .tickSize(this.height)
      .tickPadding(10);

    this.yAxis = d3.axisLeft()
      .scale(this.yScale)
      .ticks(4, ',d')
      .tickSize(-this.width)
      .tickPadding(5);

    this.view = this.svg.append('rect')
      .attr('class', 'view')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', this.width)
      .attr('height', this.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(d3.zoom()
        .scaleExtent([1 / 2, 10])
        .on('zoom', zoomed));

    this.gX = this.svg.append('g')
      .attr('class', 'axis axis--x')
      .call(this.xAxis);

    this.gY = this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(this.yAxis);

    this.radius = d3.scaleSqrt()
      .range([3, 10]);

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip d3-tooltip')
      .style('opacity', 0);

    let vendorsAndVessels = {};
    let vendCodes = {}, i, j;
    const vessels = {};
    const output = [];
    const l = this.data.length;
    j = 0;

    for (i = 0; i < l; i++) {
      const vendCode = this.data[i].vendCode;
      const vessel = this.data[i].vessel;
      const vvIndex = (this.data[i].type === 'P') ? vendCode : vessel;

      if (!vendorsAndVessels[vvIndex]) {
        j += 1;
        vendorsAndVessels[vvIndex] = j;
        if (this.data[i]) {
          output.push({
            'vendCode': vendCode,
            'type': this.data[i].type,
            'vessel': vessel,
            'vesselClass': this.data[i].vesselClass,
            'ctns': 0,
            'portCodeOrig': this.data[i].portCodeOrig,
            'whseCode': this.data[i].whseCode,
          });
        }
      } else {
        j = vendorsAndVessels[vvIndex];
      }

      output[j - 1].ctns += this.data[i].ctns;
    }

    output.sort(function (a, b) { return b.ctns - a.ctns; });

    this.displayVendors(output, this.color);

    vendCodes = {};
    vendorsAndVessels = {};
    for (i = 0; i < output.length; i++) {
      const vvIndex = (this.data[i].type === 'P') ? output[i].vendCode : output[i].vesselClass;
      vendorsAndVessels[vvIndex] = true;
    }

    // data pre-processing
    this.data.forEach(function (d: any) {

      d.y = +Number(d['ctns']);
      d.r = (d['type'] === 'P') ? +Number(d['poQtyOpn']) : +Number(100);
      d.x = Date.parse(d.eta);
      d.xa = 0;
      d.ya = 0;
      d.xaa = 0;
      d.yaa = 0;
      const vc2 = vendorsAndVessels[d.vendCode] ? d.vendCode : 'OTHER';
      const vs2 = vendorsAndVessels[d.vesselClass] ? d.vesselClass : 'OTHER_VESSEL';
      d.vvIndex2 = (d.type === 'P') ? vc2 : vs2;
    });

    this.data.sort(function (a: any, b: any) { return b.r - a.r; });
    this.dataP = this.data.filter(d => d.type === 'P');
    this.dataS = this.data.filter(d => d.type === 'S');

    this.yScale.domain(d3.extent(this.data, function (d: any) {
      return d.y;
    })).nice();

    this.radius.domain(d3.extent(this.data, function (d: any) {
      return d.r;
    })).nice();

    this.innerSvg = this.svg.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'inner-svg')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.g = this.innerSvg.append('g');


    this.poGroup = this.g.selectAll('g.bubble')
      .data(this.dataP)
      .enter().append('g')
      .attr('class', 'bubble')
      .attr('transform', function (d) {
        const tX = that.xScale(d.x) || 0;
        const tY = that.yScale(d.y) || 0;
        return `translate(${tX},${tY})`;
      });
    this.poGroup.append('circle')
      .attr('r', function (d) { return that.radius(d.r); })
      .style('fill', function (d) {
        return that.color(d['vvIndex2']);
      })
      .attr('stroke', 'black');
    this.poGroup.call(
      d3.drag().on('start', function (d: any) {
        d3.select(this).raise().classed('drag-active', true);
        d.xm0 = d3.event.x;
        d.ym0 = d3.event.y;
        d.xm1 = d3.event.x;
        d.ym1 = d3.event.y;
      }).on('drag', function (d: any) {
        d.xm1 = d3.event.x;
        d.ym1 = d3.event.y;
        d.xa = d.xm1 - d.xm0;
        d.ya = d.ym1 - d.ym0;
        d3.selectAll('.drag-active')
          .attr('transform', function (z: any, k) {
            const tX = that.xScale(z.x) + z.xaa + z.xa;
            const tY = that.yScale(z.y) + z.yaa + z.ya;
            return `translate(${tX},${tY})`;
          });
      }).on('end', function (d: any) {
        d.xaa = d.xaa + d.xa;
        d.yaa = d.yaa + d.ya;
        d3.select(this).classed('drag-active', false);
      }),
    );
    this.poGroup
      .on('mouseover', function (d) {
        const pX = d3.event.pageX + 10;
        const pY = d3.event.pageY - 28;
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(that.poTooltip(d))
          .style('left', `${pX}px`)
          .style('top', `${pY}px`);
      })
      .on('mouseout', function (d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    this.shipGroup = this.g.selectAll('g.square')
      .data(this.dataS)
      .enter().append('g')
      .attr('class', 'square')
      .attr('transform', function (d) {
        const tX = that.xScale(d.x) || 0;
        const tY = that.yScale(d.y) || 0;
        return `translate(${tX},${tY})`;
      });

    this.shipGroup.append('rect')
      .attr('width', function (d) {
        return that.calculateSquareSize(d['ctns']);
      })
      .attr('height', function (d) {
        return that.calculateSquareSize(d['ctns']);
      })
      .attr('stroke', 'black')
      .style('fill', function (d) {
        return that.color(d['vesselClass']);
      });


    this.shipGroup.call(
      d3.drag().on('start', function (d: any) {
        d3.select(this).raise().classed('drag-active', true);
        d.xm0 = d3.event.x;
        d.ym0 = d3.event.y;
        d.xm1 = d3.event.x;
        d.ym1 = d3.event.y;
      }).on('drag', function (d: any) {
        d.xm1 = d3.event.x;
        d.ym1 = d3.event.y;
        d.xa = d.xm1 - d.xm0;
        d.ya = d.ym1 - d.ym0;
        d3.selectAll('.drag-active')
          .attr('transform', function (z: any, k) {
            const tX = that.xScale(z.x) + z.xaa + z.xa;
            const tY = that.yScale(z.y) + z.yaa + z.ya;
            return `translate(${tX},${tY})`;
            // return true;
          });
      }).on('end', function (d: any) {
        d.xaa = d.xaa + d.xa;
        d.yaa = d.yaa + d.ya;
        d3.select(this).classed('drag-active', false);
      }),
    );
    this.shipGroup
      .on('mouseover', function (d) {
        const pX = d3.event.pageX + 10;
        const pY = d3.event.pageY - 28;
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(that.shipTooltip(d))
          .style('left', `${pX}px`)
          .style('top', `${pY}px`);
      })
      .on('mouseout', function (d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    this.svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - (this.height / 2))
      .attr('y', -35)
      .style('text-anchor', 'middle')
      .attr('class', 'label')
      .text('Cartons');

    this.svg.append('text')
      .attr('x', this.height + 35)
      .attr('y', (this.width / 2))
      .attr('transform', 'translate(0,20)')
      .style('text-anchor', 'middle')
      .attr('class', 'label')
      .text('ETA');

    that.reset();
    this._spinner.hide();
  }
  reset() {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
    this.applyGridStyles(this.showGridLines);
  }
  toggleGridLines() {
    this.showGridLines = !this.showGridLines;
    this.applyGridStyles(this.showGridLines);
  }
  applyGridStyles(showLines) {
    setTimeout(function () {
      if (showLines) {
        $('.axis.axis--x g.tick line').show();
        $('.axis.axis--y g.tick line').show();
      } else {
        $('.axis.axis--x g.tick line').hide();
        $('.axis.axis--y g.tick line').hide();
      }
    });
  }
  poTooltip(d) {
    const custCode = d.custCode ? ` ${d.custCode}` : ' (Stock)';
    const tooltipHeader = `<div class="tooltip-header">PO: ${d.posNo} ${custCode}</div>`;

    const tooltipRows = [];

    let tooltipBody = '<div class="tooltip-body">';

    let tooltipRow = `<div class="tooltip-row"><div>Supplier:</div><div class="tooltip-data">${d.vendCode}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>Cartons:</div><div class="tooltip-data">${d.ctns}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row">
                  <div>ETA:</div><div class="tooltip-data">${this.absFunctions.formatDate(d.eta, 'MM/dd/yyyy')}</div>
                  </div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>Units:</div><div class="tooltip-data">${d.poQtyOpn}</div></div>`;
    tooltipRows.push(tooltipRow);

    for (const tt of tooltipRows) {
      tooltipBody += tt;
    }
    tooltipBody += `</div>`;
    return `<div class="tooltip-content">${tooltipHeader}${tooltipBody}</div>`;
  }
  shipTooltip(d) {

    const tooltipHeader = `<div class="tooltip-header">Shipment: ${d.posNo}</div>`;
    let tooltipDetailsHeader = `<div class="tooltip-header">Details</div>`;
    const tooltipRows = [];
    const singleShipmentDetails = _.filter(this.shipmentDetails, { 'poShipmentNo': d.posNo });

    let tooltipBody = '<div class="tooltip-body">';
    let tooltipDetailsBody = '<div class="tooltip-body">';

    let tooltipRow = `<div class="tooltip-row"><div>Vessel:</div><div class="tooltip-data">${d.vessel}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>Cartons:</div><div class="tooltip-data">${d.ctns}</div></div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row">
                  <div>ETA:</div><div class="tooltip-data">${this.absFunctions.formatDate(d.eta, 'MM/dd/yyyy')}</div>
                  </div>`;
    tooltipRows.push(tooltipRow);

    tooltipRow = `<div class="tooltip-row"><div>CBM:</div><div class="tooltip-data">${d.cbm}</div></div>`;
    tooltipRows.push(tooltipRow);
    const poCount = singleShipmentDetails.length;
    if (poCount > 0) {
      const tooltipDetails = [];
      tooltipDetailsHeader = `<div class="tooltip-header">Details: ${poCount} POs</div>`;
      let tooltipDetailRow = `<div class="tooltip-row tooltip-grid-header">
    <div class="ttd-po">PO</div><div class="ttd-vendor">Vendor</div><div class="ttd-customer">Customer</div></div>`;
      tooltipDetails.push(tooltipDetailRow);

      for (const sd of singleShipmentDetails) {
        const custCode = (_.isNull(sd.custCode)) ? '' : sd.custCode;

        tooltipDetailRow = `<div class="tooltip-row">
    <div class="ttd-po">${sd.poOrderNo}</div>
    <div class="ttd-vendor">${sd.vendCode}</div>
    <div class="ttd-customer">${custCode}</div></div>`;
        tooltipDetails.push(tooltipDetailRow);
      }

      for (const ttd of tooltipDetails) {
        tooltipDetailsBody += ttd;
      }
      tooltipDetailsBody += `</div>`;
    }

    for (const tt of tooltipRows) {
      tooltipBody += tt;
    }
    tooltipBody += `</div>`;


    return `<div class="tooltip-content tooltip-left">${tooltipHeader}${tooltipBody}</div>
    <div class="tooltip-content tooltip-right arrow_box">${tooltipDetailsHeader}${tooltipDetailsBody}</div>`;
  }
  calculateSquareSize(ctns) {
    let squareSize = ctns / 1000;
    if (squareSize > 20) {
      squareSize = 20;
    }
    if (squareSize < 10) {
      squareSize = 10;
    }
    return squareSize;
  }
  listClick(event, newValue) {
    if (this.selectedItem !== newValue) {
      this.selectedItem = newValue;
      this.drawChart();
    }
  }
  resizeChart(menuCollapsed) {
    const svg = d3.select('#OuterSVG');
    if (svg) {
      const deltaW = (menuCollapsed) ? 250 : -250;
      const chartWidth = $('#OuterSVG').width();
      const chartHeight = $('#OuterSVG').height();
      const newH = ((chartWidth + deltaW) * chartHeight) / chartWidth;
      svg.transition()
        .duration(500)
        .attr('height', newH);
    }
  }
  displayVendors(vendors, vColors) {
    for (const V of vendors) {
      const colorKey = (V.type === 'P') ? V.vendCode : V.vesselClass;
      const legendText = (V.type === 'P') ? V.vendCode : V.vessel;
      V.keyColor = vColors(colorKey);
      V.toolTip = `Cartons: ${V.ctns}`;
      V.legendText = legendText;
      for (const PW of this.chartDataFilter) {
        if (PW.portCodeOrig === V.portCodeOrig && PW.whseCode === V.whseCode) {
          PW.portVendors = _.orderBy(vendors, 'type');
          const pos = _.filter(vendors, ['type', 'P']).length;
          const ship = _.filter(vendors, ['type', 'S']).length;
          const posHeight = (((this.absFunctions.isEven(pos) ? pos : pos + 1) / 2) * 25);
          const shipHeight = ship * 25;
          let slideoutHeight = (posHeight + shipHeight) + 15;
          if (slideoutHeight < 40) {
            slideoutHeight = 40;
          }
          PW.slideoutHeight = `${slideoutHeight}px`;
        } else {
          PW.slideoutHeight = '0px';
        }
      }
    }
    const vlHeight = $(window).height() - (100 + $('.page-top').outerHeight()
      + $('.port-list-panel .card-header').outerHeight()
      + $('.li-hr').outerHeight());
    d3.selectAll('.list-scroller')
      .style('max-height', `${vlHeight}px`)
      .style('overflow-y', 'auto')
      .style('overflow-x', 'hidden');
  }
  vlMouseOver(pv) {

    const vendOrVessel = (pv.type === 'P') ? 'vendor' : 'vessel';
    const vendOrVesselCode = (pv.type === 'P') ? pv.vendCode : pv.vesselClass;
    const baseSel = `.li-${vendOrVessel}.li-${vendOrVessel}-`;
    const itemSel = `${this.selectedItem.portCodeOrig}-${this.selectedItem.whseCode}-${vendOrVesselCode}`;
    const sel = `${baseSel}${itemSel}`;

    d3.selectAll('.li-vendor')
      .style('opacity', 0.3);
    d3.selectAll('.li-vessel')
      .style('opacity', 0.3);
    d3.select($(sel)[0])
      .style('opacity', 1);

    d3.selectAll('.bubble')
      .style('opacity', 0.3)
      .filter(function (d) { return d['vvIndex2'] === vendOrVesselCode; })
      .style('opacity', 1);
    d3.selectAll('.square')
      .style('opacity', 0.3)
      .filter(function (d) {
        return d['vesselClass'] === vendOrVesselCode;
      })
      .style('opacity', 1);
  }
  vlMouseOut(pv) {
    d3.selectAll('.li-vendor')
      .style('opacity', 1);
    d3.selectAll('.li-vessel')
      .style('opacity', 1);
    d3.selectAll('.bubble')
      .style('opacity', 1);
    d3.selectAll('.square')
      .style('opacity', 1);
  }

}
