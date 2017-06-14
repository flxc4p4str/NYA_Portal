import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../data.service';
import { GlobalState } from '../../global.state';
import * as d3 from 'd3';
import { ABSFunctions } from '../../abs.functions';

@Component({
  selector: 'nga-ports',
  styleUrls: ['./ports.scss'],
  templateUrl: './ports.html',
})
export class PortsComponent implements OnInit {

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
  private xScale: any;
  private yScale: any;
  private data;
  private zoom: any;
  private legend;
  private gX: any;
  private gY: any;
  private selectedItem;

  private view: any;
  private g: any;
  private group: any;
  private portVendors: any[];
  POTORDR1s: any[];
  PWs: any[];
  errorMessage: any;

  constructor(private absFunctions: ABSFunctions, private _dataService: DataService,
  private _state: GlobalState) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      // console.log('Menu Collapsed',isCollapsed);
      this.resizeChart(isCollapsed);
    });
  }
  ngOnInit() {

    this._dataService.getOpenPOsByPort()
      .subscribe(
      x => {
        if (x) {
          this.POTORDR1s = x.potordr1s; // x.slice(x.length-30); // data.json();
          this.PWs = x.potordr1PortWhses;

          if (this.PWs.length) {
            this.PWs.sort(function (a, b) {
              if (a.portCodeOrig + a.whseCode < b.portCodeOrig + b.whseCode) { return -1; }
              if (a.portCodeOrig + a.whseCode > b.portCodeOrig + b.whseCode) { return 1; }
              return 0;
            });

            this.selectedItem = this.PWs[10];
            this.drawChart();
          } else {
            this.selectedItem = null;
          }
        } else {
          // this.POTORDR1s = null; // this.BSTCBSCM_empty;
          this.data = null; // this.BSTCBSCM_empty;
        }
      },
      error => this.errorMessage = <any>error);

    // if (this.data) {
    //   this.drawChart();
    // }
  }

  buildPortVendorList() {

  }
  drawChart() {

    this.data = this.POTORDR1s.filter(d => d.portCodeOrig == this.selectedItem.portCodeOrig && d.whseCode == this.selectedItem.whseCode);
    console.log(this.data);

    let that = this; // need that whenever this is used in a function that is part of a return
    // this.that = this;
    let containerWidth = this.chartContainer.nativeElement.offsetWidth;
    let containerHeight = this.chartContainer.nativeElement.offsetheight;


    this.margin = { top: 30, right: 100, bottom: 60, left: 70 };
    this.width = containerWidth - this.margin.left - this.margin.right;
    let windowAR = window.screen.height / window.screen.width;

    this.height = (this.width * windowAR) - this.margin.top - this.margin.bottom;
    d3.select("svg").remove();
let cHeight = this.height + this.margin.top + this.margin.bottom;
let cWidth = this.width + this.margin.left + this.margin.right;
    this.svg = d3.select("#chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", cHeight )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", "0 0 " + cWidth + " " + cHeight)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    //  .call(this.zoom);


    let zoomed = function () {
      // that.view.attr("transform", d3.event.transform);
      // that.gX.call(that.xAxis.scale(d3.event.transform.rescaleX(that.xScale)));
      // that.gY.call(that.yAxis.scale(d3.event.transform.rescaleY(that.yScale)));
      that.gX.attr("transform", d3.event.transform);
      that.gY.attr("transform", d3.event.transform);
      that.g.attr("transform", d3.event.transform);
    }

    this.view = this.svg.append("rect")
      .attr("class", "view")
      .attr("x", 0.5)
      .attr("y", 0.5)
      .attr("width", this.width - 1)
      .attr("height", this.height - 1)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(d3.zoom()
        .scaleExtent([1 / 2, 10])
        .on("zoom", zoomed));

    // this.xScale = d3.scaleLinear()
    this.xScale = d3.scaleTime()
      .range([0, this.width]);

    //scaleLog
    //scaleLinear
    this.yScale = d3.scaleLog()
      .range([this.height, 0]);

    this.radius = d3.scaleSqrt()
      .range([2, 8]);

    this.xAxis = d3.axisBottom(this.xScale)
    //.tickSize(-1 * this.height);
    // this.xAxis = d3.axisTop(this.xScale)
    //   .tickSize(-1 * this.height)      
    //  .scale(this.xScale);

    this.yAxis = d3.axisLeft(this.yScale)
      .tickSize(5)
      .ticks(4, ",d")

    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    // this.color = d3.scaleCategory20();
    // this.color = d3.scaleCategory20().domain([0, this.data.length]).range(<any[]>['#d95f02', '#7570b3', '#d95f02', '#7570b3', '#d95f02', '#7570b3']);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


    let vendCodes = {}, output = [], l = this.data.length, i, j;
    j = 0;
    for (i = 0; i < l; i++) {
      let vendCode = this.data[i].vendCode;
      // if( vendCodes[this.data[i].vendCode]) continue;
      if (!vendCodes[vendCode]) {
        j += 1;
        vendCodes[vendCode] = j;
        output.push({
          "vendCode": vendCode,
          "poCtnsOpn": 0,
          "portCodeOrig": this.data[i].portCodeOrig,
          "whseCode": this.data[i].whseCode
        });
        // vendCodes[vendCode] = {"vendCode":vendCode, "poCtnsOpn": 0};
      } else {
        j = vendCodes[vendCode];
      }
      output[j - 1].poCtnsOpn += this.data[i].poCtnsOpn
    }

    // console.log("output",output);  // why does this display as sorted already?

    output.sort(function (a, b) { return b.poCtnsOpn - a.poCtnsOpn })

    this.displayVendors(output, this.color);

    if (output.length > 10) {
      output = output.slice(0, 9);
    };

    vendCodes = {};
    for (i = 0; i < output.length; i++) {
      let vendCode = output[i].vendCode;
      vendCodes[vendCode] = true;
    }

    // data pre-processing
    this.data.forEach(function (d: any) {
      d.y = +d["poCtnsOpn"];
      d.r = +d["poQtyOpn"];
      d.x = Date.parse(d.poDateShipBy);
      d.xa = 0;
      d.ya = 0;
      d.xaa = 0;
      d.yaa = 0;
      d.vendCode2 = vendCodes[d.vendCode] ? d.vendCode : 'OTHER';
    });

    // let minDate = d3.min(this.data, d => d["poDateShipBy"]);
    // let maxDate = d3.min(this.data, d => d["poDateShipBy"]);
    // this.xScale.domain([minDate,maxDate]);

    // .domain(d3.extent(that.data, function(d) { return d["poDateShipBy"]; }))

    this.data.sort(function (a: any, b: any) { return b.r - a.r; });

    let dateNow = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    let minX = dateNow;
    let dateNow2 = Date.now() + 60 * 24 * 60 * 60 * 1000; // 30 days ago
    let maxX = dateNow2; // d3.min(this.data, d => d["x"]);

    this.xScale.domain([minX, maxX]).nice();
    this.xScale.clamp(true);

    // this.xScale.domain(d3.extent(this.data, function (d: any) {
    //   return d.x;
    // })).nice();

    this.yScale.domain(d3.extent(this.data, function (d: any) {
      return d.y;
    })).nice();

    this.radius.domain(d3.extent(this.data, function (d: any) {
      return d.r;
    })).nice();

    this.gX = this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.xScale));

    this.gY = this.svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(this.yAxis);

    this.g = this.svg.append("g");

    this.group = this.g.selectAll("g.bubble") // this.svg.selectAll("g.bubble")
      .data(this.data)
      .enter().append("g")
      .attr("class", "bubble")
      .attr("transform", function (d, i) {
        return "translate(" + that.xScale(d.x) + "," + that.yScale(d.y) + ")"
      })
      .call(d3.drag()
        .on("start", function (d: any, i) {
          d3.select(this).raise().classed("drag-active", true);
          //console.log('drag start', d.xa, d.ya, d3.event);
          // d.xa = 0;
          // d.ya = 0;          
          d.xm0 = d3.event.x;
          d.ym0 = d3.event.y;
          d.xm1 = d3.event.x;
          d.ym1 = d3.event.y;
        }) // this.dragstarted)
        .on("drag", function (d: any, i) {
          //console.log('drag drag', d.xa, d.ya, d3.event);
          d.xm1 = d3.event.x;
          d.ym1 = d3.event.y;
          d.xa = d.xm1 - d.xm0;
          d.ya = d.ym1 - d.ym0;
          d3.selectAll(".drag-active")
            .attr("transform", function (d: any, i) {
              return "translate(" + (that.xScale(d.x) + d.xaa + d.xa) + "," + (that.yScale(d.y) + d.yaa + d.ya) + ")"
            })
        }) // this.dragged)
        .on("end", function (d: any, i) {
          //  console.log('drag end', d.xa, d.ya, d3.event)
          d.xaa = d.xaa + d.xa;
          d.yaa = d.yaa + d.ya;
          d3.select(this).classed("drag-active", false);
        }) // this.dragended))
      ).append("circle")
      .attr("r", function (d) { return that.radius(d.r); })
      .style("fill", function (d) {
        return that.color(d["vendCode2"]);
      })
       .on("mouseover", function(d) {
         let custCode = d["custCode"] ? " " + d["custCode"] : " (Stock)";
       div.transition()
         .duration(200)
         .style("opacity", .9);
       div.html("<div>PO:" + d["poOrderNo"] + custCode + "<br/><br/>"
          + "<span style='text-align:left;'>Supplier:</span>"
          + "<span style='text-align:right;'>" + d["vendCode"] + "</span>" + "<br/>"
          + "Cartons: " + d["poCtnsOpn"] + "<br/>"
          + "ETD: " + that.absFunctions.formatDate(d["poDateShipBy"], "MM/dd/yyyy") + "<br/>"
          + "Units: " + d["poQtyOpn"] + "</div>")
         .style("left", (d3.event.pageX + 10) + "px")
         .style("top", (d3.event.pageY - 28) + "px");
       })
     .on("mouseout", function(d) {
       div.transition()
         .duration(500)
         .style("opacity", 0);
       });

    // this.group
      // .append("circle")
      // .attr("r", function (d) { return that.radius(d.r); })
      // .style("fill", function (d) {
      //   return that.color(d["vendCode2"]);
      // })
    //   .on("mouseover", function (d) {
    //     // console.log(d3.event);
        
    //     d3.selectAll(".mytt")
    //       .html()
    //       .style("left", (d3.event.pageX) + "px")
    //       .style("top", (d3.event.pageY - 28) + "px")
    //       .transition().duration(200)
    //       .style("opacity", .9);
    //   })
    //   .on("mouseout", function (d) {
    //     d3.selectAll(".mytt")
    //       .transition().duration(500)
    //       .style("opacity", 0);
    //   })

  


    this.group
      .append("text")
      .attr("x", function (d) { return that.radius(d.r); })
      .attr("alignment-baseline", "middle")
      .text(function (d) {
        return d["poOrderNo"];
      });

    this.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15 - this.margin.left)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("class", "label")
      .text("Cartons");

    this.svg.append("text")
      .attr("transform",
      "translate(" + (this.width / 2) + " ," +
      (this.height + this.margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .attr("class", "label")
      .text("ETD");

    // this.legend = this.svg.selectAll(".legend")
    //   .data(this.color.domain())
    //   .enter().append("g")
    //   .attr("class", function(d){
    //     return "legend vc-" + d;
    //   })
    //   .attr("transform", function (d, i) { return "translate(2," + i * 14 + ")"; });

    // this.legend.append("rect")
    //   .attr("x", this.width)
    //   .attr("width", 12)
    //   .attr("height", 12)
    //   .style("fill", this.color);

    // this.legend.append("text")
    //   .attr("x", this.width + 16)
    //   .attr("y", 6)
    //   .attr("dy", ".35em")
    //   .style("text-anchor", "start")
    //   .text(function (d) { return d; });

    // this.legend.on("mouseover", function (type) {
    //   d3.selectAll(".legend")
    //     .style("opacity", 0.1);
    //   d3.select(this)
    //     .style("opacity", 1);
    //   d3.selectAll(".bubble")
    //     .style("opacity", 0.1)
    //     .filter(function (d) { return d["vendCode2"] == type; })
    //     .style("opacity", 1);
    // })
    //   .on("mouseout", function (type) {
    //     d3.selectAll(".legend")
    //       .style("opacity", 1);
    //     d3.selectAll(".bubble")
    //       .style("opacity", 1);
    //   });

    //   this.svg.call(this.zoom);

    let resetted = function () {
      that.svg.transition()
        .duration(750)
        .call(that.zoom.transform, d3.zoomIdentity);
    }

    // d3.select("button")
    //   .on("click", resetted);
  }

  listClick(event, newValue) {
      //   d3.selectAll(".li-slideout")
      // .style("height", 0);
    if (this.selectedItem != newValue) {
      this.selectedItem = newValue;
      this.drawChart();
    }
  }
resizeChart(menuCollapsed){
  var svg = d3.select("svg");
  if(svg){
  let deltaW = (menuCollapsed)?250:-250;
  let chartWidth = $('svg').width();
  let chartHeight = $('svg').height();
  let newH = ((chartWidth + deltaW) * chartHeight)/chartWidth;
  svg.attr("height",newH);
  }


}
  displayVendors(vendors, vColors) {
    for (let V of vendors) {
      V.keyColor = vColors(V.vendCode);
      V.toolTip = 'Cartons: ' + V.poCtnsOpn;
      for (let PW of this.PWs) {
        // PW.portVendors = [];
        if (PW.portCodeOrig === V.portCodeOrig && PW.whseCode === V.whseCode) {
          PW.portVendors = vendors;
          let vc = vendors.length;

          let slideoutHeight = ((this.absFunctions.isEven(vc) ? vc : vc + 1) / 2) * 25;
          PW.slideoutHeight = slideoutHeight + 'px';
        } else {
          PW.slideoutHeight = '0px';
        }
      }
    }
    let  vlHeight = $(window).height() - (100 + $('.page-top').outerHeight() 
      + $('.port-list-panel .card-header').outerHeight()
      + $('.li-hr').outerHeight());
    d3.selectAll(".list-scroller")
      .style("max-height", vlHeight + 'px')
      .style("overflow-y", 'auto')
      .style("overflow-x", 'hidden');
  }

  vlMouseOver(pv) {
    let sel = '.li-vendor.li-vendor-' + pv.vendCode;

    d3.selectAll(".li-vendor")
      .style("opacity", 0.3);
    d3.select($(sel)[0])
      .style("opacity", 1);

    d3.selectAll(".bubble")
      .style("opacity", 0.3)
      .filter(function (d) { return d["vendCode2"] == pv.vendCode; })
      .style("opacity", 1);
  }
  vlMouseOut(pv) {
    d3.selectAll(".li-vendor")
      .style("opacity", 1);
    d3.selectAll(".bubble")
      .style("opacity", 1);
  }

}
