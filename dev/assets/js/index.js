/*==============================================================================

	Title:    index.js

	Author:   David Leclerc

	Version:  0.1

	Date:     24.01.2017

	License:  GNU General Public License, Version 3
	          (http://www.gnu.org/licenses/gpl.html)

	Overview: ...

	Notes:    ...

==============================================================================*/

$(document).ready(function() {

	function Graph() {

		this.e = $("<div id='graph'></div>");

		/*======================================================================
			GENERATEAXIS
		======================================================================*/
		this.generateAxis = function(z0, dz, dZ) {
			// Initialize empty array
			var z = [];

			// Generate axis tick
			for (i = 0; i < (dZ / dz); i++) {
				z.unshift(z0 - i * dz);
			}

			// Add last tick based on given dZ
			z.unshift(z0 - dZ);

			return z;
		}

		/*======================================================================
			BUILDAXIS
		======================================================================*/
		this.buildAxis = function(z, z0, dz, dZ, label, name, format) {
			// Create axis node
			var axis = $("<div id='graph-" + name + "-axis' class='graph-" +
				label + "-axis'></div>");

			// Build axis based on z0, dz and dZ
			if (z.length == 0) {
				z = this.generateAxis(z0, dz, dZ);

				for (i = 0; i < z.length - 1; i++) {
					dz = z[i + 1] - z[i];

					axis.append($("<div class='graph-" +
						label +"-axis-tick'>" + z[i + 1] + "</div>")
							.css({
								"width": (dz / dZ * 100) + "%"
							})
					);
				}
			}

			// Build axis based on provided z array
			else {
				dZ = z.max() - z.min();

				for (i = 0; i < z.length - 1; i++) {
					dz = z[i + 1] - z[i];

					axis.append($("<div class='graph-" +
						label + "-axis-tick'>" + z[i] + "</div>")
							.css({
								"height": (dz / dZ * 100) + "%"
							})
					);
				}
			}

			// Format axis ticks if desired
			if (format) {
				axis.children().each(function() {
					$(this).html(convertTime($(this).html(), format));
				});
			}

			// Append axis to graph
			this.e.append(axis);
		}

		/*======================================================================
			BUILDDOTS
		======================================================================*/
		this.buildDots = function(type, graph, report, reportSection, format,
								  limits) {
			// If section of graph does not already exist, create it
			var exists = true;
			var section = this.e.find("#graph-" + graph);

			if (!section.length) {
				exists = false;
				section = ($("<div id='graph-" + graph + "'></div>"));
			}

			// Retrieve data
			var data = getData(report, reportSection, format);

			// Store data in arrays
			var x = data[0];
			var y = data[1];

			// Initialize array for dot elements
			var dots = [];

			// Build dot elements
			for (i = 0; i < x.length; i++) {
				// Stop at desired limits
				if (limits && (x[i] < limits[0] || x[i] > limits[1])) {
					continue;
				}

				dots.push($("<div class='" + type + "' x='" + x[i] +
					"' y='" + y[i] + "'></div>"));
			}

			// Append dots to graph section
			section.append(dots);

			// Append section to whole graph if it does not already exist
			if (!exists) {
				this.e.append(section);
			}
		}

		/*======================================================================
			SHOW
		======================================================================*/
		this.show = function(container) {
			container.append(this.e);
		}
	}

	// New config
	var now = new Date();
	var x = [];
	var x0 = 1474340548000;
	var dx = 1 * 60 * 60 * 1000; // Time step (h)
	var dX = 18 * 60 * 60 * 1000; // Time range (h)
	var yBG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15]; // mmol/L
	var y0BG;
	var dyBG;
	var dYBG;
	var yTBR = [0, 100, 200]; // %
	var y0TBR;
	var dyTBR;
	var dYTBR;

	// Create graph object
	var graph = new Graph();

	// Build x-axis for time
	graph.buildAxis(x, x0, dx, dX, "x", "t", "HH:MM");

	// Build y-axis for BG
	graph.buildAxis(yBG, y0BG, dyBG, dYBG, "y", "BG", false);

	// Build y-axis for I
	graph.buildAxis(yTBR, y0TBR, dyTBR, dYTBR, "y", "I", false);

	// Build NA graph section
	graph.e.append($("<div id='graph-NA'></div>"));

	// Build BG dots
	graph.buildDots("BG", "BG", "ajax/BG.json", false, "YYYY.MM.DD - HH:MM:SS", [x0 - dX, x0]);

	// Build B dots
	graph.buildDots("B", "I", "ajax/insulin.json", "Boluses", "YYYY.MM.DD - HH:MM:SS", [x0 - dX, x0]);

	// Show graph
	graph.show($("#content"));

	//var a = (new Date()).getTime();
	//var b = (new Date()).getTime();
	//alert((b - a) / 1000);





	// Config
	var now = new Date();
	//var x0 = now.getTime() - 3 * 60 * 60 * 1000;
	//var x0 = 1474340548000;
	var x = [];
	var x_ = [];
	var dx = 1 * 60 * 60 * 1000; // Time step (h)
	var dX = 18 * 60 * 60 * 1000; // Time range (h)
	var yBG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15]; // mmol/L
	var yBGMin = yBG.min();
	var yBGMax = yBG.max();
	var yTBR = [0, 100, 200]; // %
	var yTBRMin = yTBR.min();
	var yTBRMax = yTBR.max();
	var dy;
	var dYBG = yBGMax - yBGMin; // BG range (mmol/L)
	var dYTBR = yTBRMax - yTBRMin;
	var BGScale = [3, 4, 7, 12]; // (mmol/L)
	var dBGdtScale = [-0.15, -0.075, 0.075, 0.15]; // (mmol/L/m)

	// Elements
	var header = $("header");
	var loader = $("#loader");
	var graph = $("#graph");
	var graphBG = $("#graph-BG");
	var graphI = $("#graph-I");
	var xAxis = $("#graph-x-axis");
	var yAxisBG = $("#graph-y-axis-BG");
	var yAxisTBR = $("#graph-y-axis-I");
	var xTicks;
	var yTicks;
	var dash = $("#dash");
	var dashBG = dash.find(".BG");
	var dashArrow = dash.find(".arrow");
	var dashdBG = dash.find(".dBG");
	var dashdBGdt = dash.find(".dBG-dt");
	var dashTBR = dash.find(".TBR");
	var dashBR = dash.find(".BR");
	var dashIOB = dash.find(".IOB");
	var dashCOB = dash.find(".COB");
	var settings = $("#settings");
	var settingsButton = $("#settings-button");
	var bubble = $("#bubble");
	var bubbleInfo = bubble.find(".info");
	var bubbleTime = bubble.find(".time");
	var BGDots;
	var BDots;
	var TBRBars;
	
	// Sizes
	var radiusBGDot;
	var radiusBDot;
	var thicknessTBRBarBorder;
	var thicknessXAxisTick;
	var thicknessYAxisTick;

	// Global variables
	var tick;

	// Functions
	function init() {
		getTBRs();
		buildGraph();
		buildDash();
	}

	function buildGraph () {
		BGDots = graphBG.find(".BG");
		TBRBars = graphI.find(".TBR");
		BDots = graphI.find(".B");
		xTicks = $(".graph-x-axis-tick");
		yTicks = $(".graph-y-axis-tick");
		radiusBGDot = parseInt(BGDots.first().outerWidth()) / 2;
		radiusBDot = parseInt(BDots.first().outerWidth()) / 2;
		thicknessTBRBarBorder = parseInt(TBRBars.first().css("border-top-width")) || parseInt(TBRBars.first().css("border-bottom-width"));
		thicknessXAxisTick = parseInt(xTicks.first().css("border-right-width"));
		thicknessYAxisTick = parseInt(yTicks.first().css("border-bottom-width"));

		// BGs
		for (i = 0; i < BGDots.length; i++)	{
			// Actualize BG
			var BGDot = BGDots.eq(i);

			// Build BG
			buildElement(BGDot);
		}

		// TBRs
		for (i = 0; i < TBRBars.length; i++) {
			// Actualize TBR
			var TBRBar = TBRBars.eq(i);

			if (i == 0) {
				TBRBar.addClass("firstTBR");
			} else if (i == TBRBars.length - 1) {
				TBRBar.addClass("lastTBR");
			}

			// Build TBR
			buildElement(TBRBar);
		}

		// Boluses
		for (i = 0; i < BDots.length; i++) {
			// Actualize bolus
			var BDot = BDots.eq(i);

			// Build bolus
			buildElement(BDot);
		}
	}

	function buildElement(e) {
		// Get time
		var t0 = parseInt(e.attr("x"));
		var t1 = parseInt(e.next().attr("x"));

		if (e.hasClass("BG")) {
			// Get BG
			var BG = parseFloat(e.attr("y"));

			// Compute BG tick coordinates
			var x = (t0 - (x0 - dX)) / dX * graphBG.outerWidth() - radiusBGDot - thicknessXAxisTick / 2;
			var y = BG / yBGMax * graphBG.outerHeight() - radiusBGDot + thicknessYAxisTick / 2;

			// Color BG tick
			e.addClass(rankBG(BG, BGScale));

			// Position BG on graph
			e.css({
				"left": x + "px",
				"bottom": y + "px"
			});
		} else if (e.hasClass("TBR")) {
			// Get TBRs
			var prevTBR = parseInt(e.prev().attr("y"));
			var TBR = parseInt(e.attr("y"));
			var nextTBR = parseInt(e.next().attr("y"));

			// Compute TBR bar coordinates
			var x = (t0 - (x0 - dX)) / dX * graphI.outerWidth();
			var y = 100 / yTBRMax * graphI.outerHeight() - thicknessTBRBarBorder / 2;
			var w = (t1 - t0) / dX * graphI.outerWidth();
			var h = Math.abs((TBR - 100) / yTBRMax * graphI.outerHeight());
			var prevH = Math.abs((prevTBR - 100) / yTBRMax * graphI.outerHeight());
			var nextH = Math.abs((nextTBR - 100) / yTBRMax * graphI.outerHeight());

			// For high TBR
			if (TBR > 100) {
				// Add class to TBR
				e.addClass("highTBR");

				// Push inner bars up
				e.children().css({
					"margin-bottom": "auto"
				});

				// Draw contour
				if (TBR > prevTBR) {
					e.children().first().css({
						"height": h - prevH,
						"border-right": "none"
					});
				}

				if (TBR > nextTBR) {
					e.children().last().css({
						"height": h - nextH,
						"border-left": "none"
					});
				}
			} 
			// For low TBR
			else if (TBR < 100) {
				// Add class to TBR
				e.addClass("lowTBR");

				// Push inner bars down
				e.children().css({
					"margin-top": "auto"
				});

				// Draw contour
				if (TBR < prevTBR) {
					e.children().first().css({
						"height": h - prevH,
						"border-right": "none"
					});
				}

				if (TBR < nextTBR) {
					e.children().last().css({
						"height": h - nextH,
						"border-left": "none"
					});
				}
			}
			// For no TBR
			else {
				// Add class to TBR
				e.addClass("noTBR");

				// Baseline should only be one line
				e.css({
					"border-top": "none"
				});

				// No side-borders needed on inner bars
				e.children().css({
					"border": "none"
				});
			}

			// TBR crosses baseline
			if (prevTBR < 100 && TBR > 100) {
				e.children().first().css({
					"height": h - thicknessTBRBarBorder,
				});

				e.prev().children().last().css({
					"height": prevH - thicknessTBRBarBorder,
				});
			} else if (nextTBR < 100 && TBR > 100) {
				e.children().last().css({
					"height": h - thicknessTBRBarBorder,
				});

				e.next().children().first().css({
					"height": nextH - thicknessTBRBarBorder,
				});
			}

			// Minor TBRs
			if (h < 2 * thicknessTBRBarBorder) {
				h = thicknessTBRBarBorder;

				e.children().css({
					"border": "none"
				});

				if (TBR > 100) {
					e.css({
						"border-top": "none"
					});
				} else if (TBR < 100) {
					e.css({
						"border-bottom": "none"
					});
				}
			}

			// Low TBRs
			if (TBR < 100) {
				// Move bar under baseline
				y -= h;

				// Recenter bar with Y-Axis
				y += thicknessTBRBarBorder;
			}

			// Position TBR on graph
			e.css({
				"left": x + "px",
				"bottom": y + "px",
				"width": w + "px",
				"height": h + "px"
			});
		} else if (e.hasClass("B")) {
			// Get bolus
			var B = parseFloat(e.attr("y"));

			// Compute BG tick coordinates
			var x = (t0 - (x0 - dX)) / dX * graphI.outerWidth() - radiusBDot - thicknessXAxisTick / 2;
			var y = 100 / yTBRMax * graphI.outerHeight() - radiusBDot + thicknessYAxisTick / 2;

			// Position BG on graph
			e.css({
				"left": x + "px",
				"bottom": y + "px"
			});
		}

		// Show bubble
		e.on("mouseenter", function () {
			buildBubble($(this));
		});

		// Hide bubble
		e.on("mouseleave", function () {
			bubble.hide();
		});
	}

	function buildBubble (e) {
		// Get time
		var t = convertTime(e.attr("x"), "HH:MM - DD.MM.YYYY");

		// Add time
		bubbleTime.html(t);

		if (e.hasClass("BG")) {
			// Get info
			var BG = roundBG(e.attr("y"));
			var BGType = rankBG(BG, BGScale);

			// Add info to bubble
			bubbleInfo.html("<span class='BG " + BGType + "'>" + BG + "</span> mmol/L");
		} else if (e.hasClass("TBR")) {
			// Get info
			var TBR = roundTBR(e.attr("y"));

			// Add info to bubble
			bubbleInfo.html("<span class='TBR'>" + TBR + "</span>%");
		} else if (e.hasClass("B")) {
			// Get info
			var B = roundB(e.attr("y"));

			// Add info to bubble
			bubbleInfo.html("<span class='B'>" + B + "</span> U");
		}

		// Define bubble coordinates
		var x = parseFloat(e.offset().left) + parseFloat(e.css("width")) + 5;
		var y = parseFloat(e.offset().top) - header.outerHeight();


		// Position bubble on graph
		bubble.css({
			"left": x + "px",
			"top": y + "px"
		});

		// If bubble exceeds width of graph
		if (x + bubble.outerWidth() > graph.outerWidth()) {
			bubble.css({
				"left": x - 1.5 * 10 - bubble.outerWidth() + "px"
			});
		}

		// If bubble exceeds height of graph
		if (y + bubble.outerHeight() > graph.outerHeight()) {
			bubble.css({
				"top": y - 1.5 * 10 - bubble.outerHeight() + "px"
			});
		}

		// Show bubble
		bubble.show();
	}

	function buildDash () {
		// Get last BG
		var lastBG = roundBG(BGDots.eq(-1).attr("y"));
		var lastBGType = rankBG(lastBG, BGScale);

		// Add to dash
		dashBG.text(lastBG);

		// Color last BG
		dashBG.addClass(lastBGType);

		// Get dBG over last 5 minutes
		var dBG = roundBG(BGDots.eq(-1).attr("y") - BGDots.eq(-2).attr("y"));

		// Add to dash
		dashdBG.text(dBG);

		// Get dBG/dt over last 5 minutes
		var dt = (parseInt(BGDots.eq(-1).attr("x")) - parseInt(BGDots.eq(-2).attr("x"))) / 1000 / 60; // (m)
		var dBGdt = roundBG(dBG / dt);

		// Add to dash
		dashdBGdt.text(dBGdt);

		// Select arrow and add it to dash
		dashArrow.text(rankdBGdt(dBGdt, dBGdtScale));

		// Color arrow
		dashArrow.addClass(lastBGType);

		// Get current TBR
		var TBR = roundTBR(TBRBars.eq(-2).attr("y"));

		// Add to dash
		dashTBR.text(TBR);
	}

	function toggleSettings () {
		// Get coordinates and size of settings menu
		var x = Math.abs(parseFloat(settings.css("right")));
		var X = settings.outerWidth();

		// Decide on sliding direction
		if (settings.hasClass("is-active")) {
			settings.stop().animate({
				right: "-=" + (X - x)
			});
		} else {
			settings.stop().animate({
				right: "+=" + x
			});			
		}

		// Toggle defining class
		settings.toggleClass("is-active");
	}

	function getTBRs () {
		// Create TBR arrays
		var TBRTimes = [];
		var TBRs = [];
		var TBRUnits = [];
		var TBRDurations = [];

		// Turn off async AJAX
		$.ajaxSetup({
			async: false
		});

		// Get boluses with AJAX
		$.getJSON("ajax/insulin.json", function (data) {
			// Store boluses with epoch time
			$.each(data["Temporary Basals"], function (key, value) {
				TBRTimes.push(convertTime(key, "YYYY.MM.DD - HH:MM:SS"));
				TBRs.push(value[0]);
				TBRUnits.push(value[1]);
				TBRDurations.push(value[2] * 60 * 1000);
				
			});
		});

		// Turn on async AJAX
		$.ajaxSetup({
			async: true
		});

		// Sort TBR times in case they aren't already
		var indices = sortWithIndices(TBRTimes);

		// Sort rest of TBR infos according to time sorted indices
		var TBRs_ = [];
		var TBRUnits_ = [];
		var TBRDurations_ = [];

		for (i = 0; i < TBRs.length; i++) {
			TBRs_[i] = TBRs[indices[i]];
			TBRUnits_[i] = TBRUnits[indices[i]];
			TBRDurations_[i] = TBRDurations[indices[i]];
		}

		// Reassign TBRs with sorted ones
		TBRs = TBRs_;
		TBRUnits = TBRUnits_;
		TBRDurations = TBRDurations_;

		// Reconstruct TBR profile
		// TBR Profiler
		n = TBRs.length;
		TBRTimes_ = [];
		TBRs_ = [];
		TBRUnits_ = [];

		for (i = 0; i < n; i++) {
			// Add current point in time to allow next comparisons
			if (i == n - 1) {
				TBRTimes.push(x0);
				TBRs.push(TBRs_.last());
				TBRUnits.push(TBRUnits_.last());
			}

			//Ignore TBR cancel associated with unit change
			if (TBRs[i] == 0 && TBRDurations[i] == 0 && TBRUnits[i + 1] != TBRUnits[i] && TBRTimes[i + 1] - TBRTimes[i] < 5 * 60 * 1000) {
				continue;
			}

			// Add TBR to profile if different than last
			if (TBRs[i] != TBRs_.last() || TBRUnits[i] != TBRUnits_.last()) {
				TBRTimes_.push(TBRTimes[i]);
				TBRs_.push(TBRs[i]);
				TBRUnits_.push(TBRUnits[i]);
			}

			// Add a point in time if current TBR ran completely
			if (TBRDurations[i] != 0 && TBRTimes[i] + TBRDurations[i] < TBRTimes[i + 1]) {
				TBRTimes_.push(TBRTimes[i] + TBRDurations[i]);
				TBRs_.push(100);
				TBRUnits_.push(TBRUnits_.last());
			}
		}

		// Add first point left of graph
		TBRTimes_.unshift(x0 - dX);
		TBRs_.unshift(100);
		TBRUnits_.unshift(TBRUnits.first());

		// Add current point in time
		TBRTimes_.push(TBRTimes.last());
		TBRs_.push(TBRs.last());
		TBRUnits_.push(TBRUnits.last());

		// Display TBRs
		for (i = 0; i < TBRs_.length; i++) {
			graphI.append($("<div class='TBR' x='" + TBRTimes_[i] + "' y='" + roundTBR(TBRs_[i]) + "'></div>"));

			for (j = 0; j < 2; j++) {
				graphI.children().last().append($("<div class='innerTBRBar'></div>"));
			}
		}

		// Return boluses
		return [TBRTimes, TBRs, TBRUnits];
	}



	// Main
	init();

	$(window).resize(function () {
		buildGraph();
	});

	settingsButton.on("click", function () {
		toggleSettings();
	});

});