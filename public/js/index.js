const campusLocations = {
  "East Bank": {
    center: [44.9740, -93.2354],
    zoom: 15.5,
  },
  "West Bank": {
    center: [44.9670, -93.2520],
    zoom: 15.5,
  },
  "St. Paul": {
    center: [44.9850, -93.1850],
    zoom: 15.5,
  },
};

const map = L.map("map", {
  zoomControl: false,
}).setView(campusLocations["East Bank"].center, campusLocations["East Bank"].zoom);

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
  maxZoom: 18,
  minZoom: 13,
}).addTo(map);

L.control.zoom({
  position: "bottomright",
}).addTo(map);

const layerGroups = {};

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.name) {
    let popupContent = feature.properties.name;

    if (feature.properties.hall) {
      popupContent += "<br>Building: " + feature.properties.hall;
    }

    if (feature.properties.floor) {
      popupContent += "<br>Floor: " + feature.properties.floor;
    }

    if (feature.properties.note) {
      popupContent += "<br>Note: " + feature.properties.note;
    }

    if (feature.properties.stop) {
      popupContent += "<br>Stop: " + feature.properties.stop;
    }

    if (feature.properties.route) {
      popupContent += "<br>Routes: " + feature.properties.route;
    }

    layer.bindPopup(popupContent);
  }
}

// Marker Colors/Icons for each category
const markerColors = {
  coffee: {url: "../icons/coffee.png", size: [25, 25]},
  vending: {url: "../icons/vending.png", size: [17, 21]},
  study: {url: "../icons/book.png", size: [20, 24]},
  microwaves: {url: "../icons/microwave.png", size: [24, 24]},
  bathrooms: {url: "../icons/toilet.png", size: [24, 24]},
  parkinggarages: {url: "../icons/parking.png", size: [21, 21]},
  busstops: {url: "../icons/bus.png", size: [30, 30]},
  bike: {url: "../icons/bike.png", size: [30, 30]},
};

// Category name mapping for search (category key -> display names)
const categoryNames = {
  coffee: ["coffee", "coffee shop", "coffee shops", "cafe", "café", "espresso", "latte", "cappuccino", "brew", "java", "roast", "barista", "咖啡", "咖啡店", "咖啡馆", "星巴克", "拿铁", "美式咖啡"],
  study: ["study", "study space", "study spaces", "studying", "library", "reading", "quiet", "desk", "workspace", "learning", "academic", "学习", "学习空间", "自习", "自习室", "图书馆", "阅览室", "安静"],
  vending: ["vending", "vending machine", "vending machines", "snack", "snacks", "drink", "drinks", "soda", "candy", "chips", "food machine", "自动售货机", "售货机", "零食", "饮料", "贩卖机"],
  microwaves: ["microwave", "microwaves", "oven", "heat", "warm", "food", "lunch", "meal", "微波炉", "加热", "热饭", "午餐", "食物"],
  bike: ["bike", "bicycle", "bike parking", "bicycle parking", "cycling", "cyclist", "biker", "bikes", "bicycles", "rack", "bike rack", "自行车", "单车", "自行车停车", "停车", "车架", "自行车架"],
  bathrooms: ["bathroom", "bathrooms", "restroom", "restrooms", "toilet", "toilets", "washroom", "washrooms", "gender-neutral", "gender neutral", "all-gender", "all gender", "unisex", "neutral", "卫生间", "洗手间", "厕所", "中性卫生间", "无性别卫生间", "通用卫生间"],
  parkinggarages: ["parking", "parking garage", "parking garages", "garage", "garages", "car park", "car parking", "vehicle", "停车", "停车场", "停车库", "车库", "停车位"],
  busstops: ["bus", "bus stop", "bus stops", "busstop", "busstation", "bus station", "transit", "transportation", "gopher bus", "公交车", "公交站", "巴士", "巴士站", "公交车站", "交通"],
};

function createCustomMarker(feature, latlng, iconOrColor) {
  let icon;
  if (typeof iconOrColor === "object") {
    // custom icon
    icon = L.icon({
      iconUrl: iconOrColor.url,
      iconSize: iconOrColor.size || [25, 41],
      iconAnchor: [
                iconOrColor.size ? iconOrColor.size[0] / 2 : 12,
                iconOrColor.size ? iconOrColor.size[1] : 41,
      ],
      popupAnchor: [1, -34],
    });
  } else {
    // default icon
    icon = L.icon({
      iconUrl: "data:image/svg+xml;base64," + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
                    <path fill="${iconOrColor}" stroke="#fff" stroke-width="1.5" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
                    <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
                </svg>
            `),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }

  return L.marker(latlng, {icon: icon});
}

function getWaypoint(filename, layerName, color) {
  fetch("http://23.152.226.72:8080/waypoint/" + filename)
      .then(parseWaypoint.bind(null, layerName, color));
}

function parseWaypoint(response, layerName, color) {
  if (response.status !== 200) {
    return;
  }

  response.json()
      .then(addWaypoints.bind(null, layerName, color));
}

function addWaypoints(data, layerName, color) {
  layers[layerName] = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, color),
    onEachFeature: onEachFeature,
  }).addTo(map);
}

// when adding a new set of objects, copy the following line and change test to your variable

// getWaypoint("coffee.json", "coffee", markerColors.coffee);

layerGroups.coffee = L.geoJSON(coffee, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.coffee),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.vending = L.geoJSON(vending, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.vending),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.study = L.geoJSON(study, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.study),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.microwaves = L.geoJSON(microwaves1, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.microwaves),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.parkinggarages = L.geoJSON(parkinggarages, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.parkinggarages),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.bike = L.geoJSON(bike, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.bike),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.bathrooms = L.geoJSON(bathrooms, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.bathrooms),
  onEachFeature: onEachFeature,
}).addTo(map);

layerGroups.busstops = L.geoJSON(busstops, {
  pointToLayer: (feature, latlng) => createCustomMarker(feature, latlng, markerColors.busstops),
  onEachFeature: onEachFeature,
}).addTo(map);

// Function to toggle layer visibility
function toggleLayer(category, isVisible) {
  if (layerGroups[category]) {
    if (isVisible) {
      map.addLayer(layerGroups[category]);
    } else {
      map.removeLayer(layerGroups[category]);
    }
  }
}

// Search functionality: store all markers for searching
let allMarkers = [];

// Collect all markers into search array
function collectAllMarkers() {
  allMarkers = [];
  Object.keys(layerGroups).forEach((category) => {
    layerGroups[category].eachLayer((layer) => {
      if (layer.feature) {
        const feature = layer.feature;
        let searchText = "";
        if (feature.properties) {
          if (feature.properties.name) searchText += feature.properties.name + " ";
          if (feature.properties.hall) searchText += feature.properties.hall + " ";
          if (feature.properties.location) searchText += feature.properties.location + " ";
          if (feature.properties.floor) searchText += feature.properties.floor + " ";
          if (feature.properties.note) searchText += feature.properties.note + " ";
        }
        allMarkers.push({
          layer: layer,
          feature: feature,
          searchText: searchText.toLowerCase().trim(),
          category: category,
        });
      }
    });
  });
}

// Search markers and show only matching results
let isSearching = false;
let searchResultLayers = [];
const originalButtonOrder = []; // Store original button order for restoration
let originalButtonStates = {}; // Store original button active states for restoration

// Function to search by category
function searchByCategory(query) {
  const searchQuery = query.toLowerCase().trim();
  const matchingCategories = [];

  // Find matching categories (exclude filler)
  Object.keys(categoryNames).forEach((category) => {
    // Skip filler category
    if (category === "filler") {
      return;
    }

    const names = categoryNames[category];
    const matches = names.some((name) => {
      return name.toLowerCase().includes(searchQuery);
    });
    if (matches) {
      matchingCategories.push(category);
    }
  });

  return matchingCategories;
}

// Function to search markers
function searchMarkers(query, mode) {
  // Clear previous search result layers
  searchResultLayers.forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
  searchResultLayers = [];

  // Get no results element
  const noResultsElement = document.getElementById("searchNoResults");

  if (!query || query.trim() === "") {
    // Clear search: restore all markers visibility based on toggle button states
    isSearching = false;

    // Hide no results message
    if (noResultsElement) {
      noResultsElement.style.display = "none";
    }

    // Save current button states before restoring (in case they were modified during search)
    let savedStates = {};
    if (Object.keys(originalButtonStates).length > 0) {
      savedStates = originalButtonStates;
    } else {
      // If no saved states, restore to initial state (all active except filler)
      Object.keys(layerGroups).forEach((category) => {
        savedStates[category] = true; // All layers active by default
      });
      // Also handle filler buttons and any other buttons
      const toggleButtonsContainerRestore = document.querySelector(".toggle-buttons");
      if (toggleButtonsContainerRestore) {
        toggleButtonsContainerRestore.querySelectorAll(".toggle-btn").forEach((button) => {
          const category = button.getAttribute("data-category");
          if (savedStates[category] === undefined) {
            savedStates[category] = (category !== "filler"); // All active except filler
          }
        });
      }
    }

    // Reset saved button states so they can be saved again on next search
    originalButtonStates = {};

    // Restore all buttons visibility and order (only category buttons in toggleButtonsContainer)
    const toggleButtonsContainer = document.querySelector(".toggle-buttons");
    if (toggleButtonsContainer && originalButtonOrder.length > 0) {
      // Remove all buttons from container
      const allButtons = Array.from(toggleButtonsContainer.querySelectorAll(".toggle-btn"));
      allButtons.forEach((btn) => {
        if (btn.parentNode === toggleButtonsContainer) {
          toggleButtonsContainer.removeChild(btn);
        }
      });

      // Restore original order and states (only buttons with category)
      originalButtonOrder.forEach((btn) => {
        const category = btn.getAttribute("data-category");
        // Only restore buttons with category (not add-btn)
        if (category) {
          btn.style.display = "";
          // Restore saved active state
          if (savedStates[category] !== undefined) {
            if (savedStates[category]) {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }
          } else {
            // If no saved state, restore to initial state (all active except filler)
            if (category !== "filler") {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }
          }
          if (btn.parentNode !== toggleButtonsContainer) {
            toggleButtonsContainer.appendChild(btn);
          }
        }
      });
    } else {
      // Fallback: just show all category buttons and restore states
      if (toggleButtonsContainer) {
        toggleButtonsContainer.querySelectorAll(".toggle-btn").forEach((button) => {
          const category = button.getAttribute("data-category");
          // Only restore buttons with category (not add-btn)
          if (category) {
            button.style.display = "";
            if (savedStates[category] !== undefined) {
              if (savedStates[category]) {
                button.classList.add("active");
              } else {
                button.classList.remove("active");
              }
            } else {
              // If no saved state, restore to initial state (all active except filler)
              if (category !== "filler") {
                button.classList.add("active");
              } else {
                button.classList.remove("active");
              }
            }
          }
        });
      }
    }

    // Restore all layer visibility based on toggle button states (only category buttons)
    if (toggleButtonsContainer) {
      toggleButtonsContainer.querySelectorAll(".toggle-btn").forEach((button) => {
        const category = button.getAttribute("data-category");
        // Only process buttons with category (not add-btn)
        if (category) {
          const isActive = button.classList.contains("active");
          toggleLayer(category, isActive);
        }
      });
    }

    return [];
  }

  isSearching = true;
  let results = [];

  // Save button states before search (only if not already saved and we're actually searching)
  if (Object.keys(originalButtonStates).length === 0 && query && query.trim() !== "") {
    const toggleButtonsContainerSave = document.querySelector(".toggle-buttons");
    if (toggleButtonsContainerSave) {
      toggleButtonsContainerSave.querySelectorAll(".toggle-btn").forEach((button) => {
        const category = button.getAttribute("data-category");
        // Only save buttons with category (not add-btn)
        if (category) {
          originalButtonStates[category] = button.classList.contains("active");
        }
      });
    }
  }

  if (mode === "category") {
    // Hide all original layer groups first (only for category search)
    Object.keys(layerGroups).forEach((category) => {
      if (map.hasLayer(layerGroups[category])) {
        map.removeLayer(layerGroups[category]);
      }
    });
    // Search by category
    const matchingCategories = searchByCategory(query);
    const toggleButtonsContainerCat = document.querySelector(".toggle-buttons");

    if (matchingCategories.length > 0) {
      // Hide no results message
      if (noResultsElement) {
        noResultsElement.style.display = "none";
      }

      // First, deactivate all toggle buttons (only category buttons, not add-btn)
      if (toggleButtonsContainerCat) {
        toggleButtonsContainerCat.querySelectorAll(".toggle-btn").forEach((button) => {
          button.classList.remove("active");
        });
      }

      // Collect matching and non-matching buttons (only from toggleButtonsContainer)
      const matchingButtons = [];
      const nonMatchingButtons = [];

      if (toggleButtonsContainerCat) {
        toggleButtonsContainerCat.querySelectorAll(".toggle-btn").forEach((button) => {
          const category = button.getAttribute("data-category");
          // Skip buttons without category (like add-btn if it's in the container)
          if (!category) {
            return;
          }
          if (matchingCategories.indexOf(category) !== -1) {
            matchingButtons.push(button);
            button.classList.add("active");
            button.style.display = ""; // Show matching buttons
          } else {
            nonMatchingButtons.push(button);
            button.style.display = "none"; // Hide non-matching buttons
          }
        });

        // Reorder: matching buttons first, then non-matching (hidden)
        // Remove all buttons from container
        const allButtonsInContainer = Array.from(toggleButtonsContainerCat.querySelectorAll(".toggle-btn"));
        allButtonsInContainer.forEach((btn) => {
          const btnCategory = btn.getAttribute("data-category");
          // Only remove buttons with category (not add-btn)
          if (btnCategory && btn.parentNode === toggleButtonsContainerCat) {
            toggleButtonsContainerCat.removeChild(btn);
          }
        });

        // Add matching buttons first (ensure they're visible)
        matchingButtons.forEach((btn) => {
          btn.style.display = ""; // Ensure visible
          toggleButtonsContainerCat.appendChild(btn);
        });

        // Add non-matching buttons (hidden) at the end
        nonMatchingButtons.forEach((btn) => {
          btn.style.display = "none"; // Ensure hidden
          toggleButtonsContainerCat.appendChild(btn);
        });
      }

      var bounds = L.latLngBounds([]);

      matchingCategories.forEach((category) => {
        if (layerGroups[category]) {
          // Collect all features from this category
          const categoryFeatures = [];
          layerGroups[category].eachLayer((layer) => {
            if (layer.feature) {
              categoryFeatures.push(layer.feature);

              // Get coordinates for bounds
              const coords = layer.feature.geometry.coordinates;
              if (coords && coords.length >= 2) {
                const latlng = [coords[1], coords[0]];
                bounds.extend(latlng);
              }
            }
          });

          if (categoryFeatures.length > 0) {
            const filteredLayer = L.geoJSON({
              type: "FeatureCollection",
              features: categoryFeatures,
            }, {
              pointToLayer: function(feature, latlng) {
                const color = markerColors[category] || "#808080";
                return createCustomMarker(feature, latlng, color);
              },
              onEachFeature: onEachFeature,
            });

            filteredLayer.addTo(map);
            searchResultLayers.push(filteredLayer);
          }
        }
      });

      // Zoom to show all matching categories
      if (bounds.isValid()) {
        map.fitBounds(bounds, {padding: [50, 50]});
      }

      results = matchingCategories;
    } else {
      // Show no results message
      if (noResultsElement) {
        noResultsElement.style.display = "block";
      }

      // Hide all category buttons when no results (but keep add-btn visible)
      if (toggleButtonsContainerCat) {
        toggleButtonsContainerCat.querySelectorAll(".toggle-btn").forEach((button) => {
          const category = button.getAttribute("data-category");
          // Only hide buttons with category (not add-btn)
          if (category) {
            button.style.display = "none";
            button.classList.remove("active");
          }
        });
      }
    }
  } else {
    // Search by mark (original search logic)
    // First, hide all original layer groups for mark search
    Object.keys(layerGroups).forEach((category) => {
      if (map.hasLayer(layerGroups[category])) {
        map.removeLayer(layerGroups[category]);
      }
    });

    // Also clear any search result layers from previous searches
    searchResultLayers.forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    searchResultLayers = [];

    // Restore all buttons visibility when searching by mark
    const toggleButtonsContainerMark = document.querySelector(".toggle-buttons");
    if (toggleButtonsContainerMark) {
      toggleButtonsContainerMark.querySelectorAll(".toggle-btn").forEach((button) => {
        const category = button.getAttribute("data-category");
        // Only restore buttons with category (not add-btn)
        if (category) {
          button.style.display = "";
        }
      });
    }

    // Restore original button order if needed
    if (toggleButtonsContainerMark && originalButtonOrder.length > 0) {
      const currentButtons = Array.from(toggleButtonsContainerMark.querySelectorAll(".toggle-btn"));
      const categoryButtons = currentButtons.filter((btn) => {
        return btn.getAttribute("data-category");
      });
      let needsReorder = false;

      // Check if order needs to be restored
      for (let i = 0; i < Math.min(categoryButtons.length, originalButtonOrder.length); i++) {
        if (categoryButtons[i] !== originalButtonOrder[i]) {
          needsReorder = true;
          break;
        }
      }

      if (needsReorder) {
        categoryButtons.forEach((btn) => {
          if (btn.parentNode === toggleButtonsContainerMark) {
            toggleButtonsContainerMark.removeChild(btn);
          }
        });
        originalButtonOrder.forEach((btn) => {
          if (btn.parentNode !== toggleButtonsContainerMark) {
            toggleButtonsContainerMark.appendChild(btn);
          }
        });
      }
    }

    const searchQuery = query.toLowerCase().trim();
    results = allMarkers.filter((marker) => {
      return marker.searchText.includes(searchQuery);
    });

    // Show only matching markers
    if (results.length > 0) {
      // Hide no results message
      if (noResultsElement) {
        noResultsElement.style.display = "none";
      }

      var bounds = L.latLngBounds([]);
      const categoriesToShow = {};

      // Group results by category
      results.forEach((result) => {
        categoriesToShow[result.category] = true;

        // Get coordinates from feature geometry
        const coords = result.feature.geometry.coordinates;
        if (coords && coords.length >= 2) {
          // Note: GeoJSON format is [longitude, latitude], Leaflet needs [latitude, longitude]
          const latlng = [coords[1], coords[0]];
          bounds.extend(latlng);
        }
      });

      // Create filtered layer groups with only matching markers
      Object.keys(categoriesToShow).forEach((category) => {
        if (layerGroups[category]) {
          // Create a new GeoJSON layer with only matching features
          const matchingFeatures = results
              .filter((r) => {
                return r.category === category;
              })
              .map((r) => {
                return r.feature;
              });

          if (matchingFeatures.length > 0) {
            const filteredLayer = L.geoJSON({
              type: "FeatureCollection",
              features: matchingFeatures,
            }, {
              pointToLayer: function(feature, latlng) {
                const color = markerColors[category] || "#808080";
                return createCustomMarker(feature, latlng, color);
              },
              onEachFeature: onEachFeature,
            });

            filteredLayer.addTo(map);
            searchResultLayers.push(filteredLayer);
          }
        }
      });

      // If only one result, zoom in; if multiple, show all results
      if (results.length === 1) {
        const coords = results[0].feature.geometry.coordinates;
        if (coords && coords.length >= 2) {
          map.setView([coords[1], coords[0]], 17);
        }
      } else if (results.length > 1) {
        map.fitBounds(bounds, {padding: [50, 50]});
      }
    } else {
      // Show no results message
      if (noResultsElement) {
        noResultsElement.style.display = "block";
      }

      // Don't restore layers when no results - keep them hidden (same as project 3)
    }
  }

  return results;
}

// Wait for DOM to load before binding events
document.addEventListener("DOMContentLoaded", () => {
  // When page first loads side bar is visible
  $(".side-bar").addClass("active");
  $(".menu-btn").css("visibility", "hidden");

  // Get toggle buttons container
  const toggleButtonsContainer = document.querySelector(".toggle-buttons");

  // Save original button order for restoration (only category buttons, not add-btn)
  if (toggleButtonsContainer) {
    toggleButtonsContainer.querySelectorAll(".toggle-btn").forEach((button) => {
      const category = button.getAttribute("data-category");
      // Only save buttons with category (not add-btn)
      if (category) {
        originalButtonOrder.push(button);
      }
    });
  }

  // Bind toggle button events (Unnecessary and should be cleaned up)
  if (toggleButtonsContainer) {
    toggleButtonsContainer.querySelectorAll(".toggle-btn").forEach((button) => {
      const category = button.getAttribute("data-category");
      // Only process buttons with category (not add-btn)
      if (category) {
        // Skip filler buttons - they don't have layers
        if (category == "coffee") {
          button.classList.add("active");
          toggleLayer(category, true);
        } else {
          button.classList.remove("active");
          toggleLayer(category, false);
        }
      }
    });
  }

  // Bind click events for category buttons only
  if (toggleButtonsContainer) {
    toggleButtonsContainer.querySelectorAll(".toggle-btn").forEach((button) => {
      const category = button.getAttribute("data-category");
      // Only bind events for buttons with category (not add-btn)
      if (category) {
        button.addEventListener("click", function() {
          const isActive = this.classList.contains("active");

          if (isActive) {
            this.classList.remove("active");
            toggleLayer(category, false);
          } else {
            this.classList.add("active");
            toggleLayer(category, true);
          }
        });
      }
    });
  }

  // Bind campus dropdown events
  document.querySelectorAll(".dropdown-content a[data-campus]").forEach((link) => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const campusName = this.getAttribute("data-campus");
      const campus = campusLocations[campusName];

      if (campus) {
        // Update dropdown button text
        const dropdownBtn = document.getElementById("campusDropdown");
        if (dropdownBtn) {
          dropdownBtn.innerHTML = campusName + " <i class=\"fas fa-angle-down\"></i>";
        }

        // Fly to the campus location
        map.flyTo(campus.center, campus.zoom);
      }
    });
  });

  // Initialize marker collection
  collectAllMarkers();

  // Bind search input events
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    // Search on input (only if there's actual content)
    searchInput.addEventListener("input", function() {
      const query = this.value;
      const searchMode = document.querySelector("input[name=\"searchMode\"]:checked");
      const mode = searchMode ? searchMode.value : "mark";
      // Only search if there's actual content, otherwise clear search
      if (query && query.trim() !== "") {
        searchMarkers(query, mode);
      } else {
        searchMarkers("", mode);
      }
    });

    // Also trigger search when search mode changes
    document.querySelectorAll("input[name=\"searchMode\"]").forEach((radio) => {
      radio.addEventListener("change", function() {
        const query = searchInput.value;
        const mode = this.value;
        // Only search if there's actual content, otherwise clear search
        if (query && query.trim() !== "") {
          searchMarkers(query, mode);
        } else {
          searchMarkers("", mode);
        }
      });
    });
  }

  const formCategory = document.getElementById("form-category");
  const labelHall = document.getElementById("label-hall");
  const labelFloor = document.getElementById("label-floor");
  const labelNote = document.getElementById("label-note");
  const inputHall = document.getElementById("form-hall");
  const inputFloor = document.getElementById("form-floor");
  const inputNote = document.getElementById("form-note");

  const formConfigs = {
    study: {
      hallLabel: "Building (Hall):",
      hallPlaceholder: "e.g. Walter Library",
      floorLabel: "Floor(s):",
      floorPlaceholder: "e.g. basement, 2",
      noteLabel: "Note:",
      notePlaceholder: "Optional details (quiet, crowded, etc.)",
      defaultName: "Study Space",
    },
    busstops: {
      hallLabel: "Stop Name:",
      hallPlaceholder: "e.g. Washington Ave & Coffman Union",
      floorLabel: "Routes:",
      floorPlaceholder: "e.g. 121, 122, 123",
      noteLabel: "Note:",
      notePlaceholder: "Optional (e.g. Only weekdays, every 10 min)",
      defaultName: "Bus Stop",
    },
    coffee: {
      hallLabel: "Building (Hall):",
      hallPlaceholder: "e.g. Coffman Memorial Union",
      floorLabel: "Floor:",
      floorPlaceholder: "e.g. 1",
      noteLabel: "Note:",
      notePlaceholder: "e.g. Starbucks, Caribou, etc.",
      defaultName: "Coffee Shop",
    },
    microwaves: {
      hallLabel: "Building (Hall):",
      hallPlaceholder: "e.g. Bruininks Hall",
      floorLabel: "Floor:",
      floorPlaceholder: "e.g. 2",
      noteLabel: "Note:",
      notePlaceholder: "e.g. In lounge, near vending",
      defaultName: "Microwave",
    },
    vending: {
      hallLabel: "Building (Hall):",
      hallPlaceholder: "e.g. Moos Tower",
      floorLabel: "Floor:",
      floorPlaceholder: "e.g. Basement",
      noteLabel: "Note:",
      notePlaceholder: "e.g. Snacks only, drinks only",
      defaultName: "Vending Machine",
    },
    bike: {
      hallLabel: "Nearby building / area:",
      hallPlaceholder: "e.g. Keller Hall entrance",
      floorLabel: "Details:",
      floorPlaceholder: "e.g. Covered rack, 10 spots",
      noteLabel: "Note:",
      notePlaceholder: "Optional",
      defaultName: "Bike Parking",
    },
    bathrooms: {
      hallLabel: "Building (Hall):",
      hallPlaceholder: "e.g. Lind Hall",
      floorLabel: "Floor / room:",
      floorPlaceholder: "e.g. 1st floor, near 110",
      noteLabel: "Note:",
      notePlaceholder: "e.g. All-gender, accessible",
      defaultName: "Bathroom",
    },
    parkinggarages: {
      hallLabel: "Garage / Lot name:",
      hallPlaceholder: "e.g. Washington Avenue Ramp",
      floorLabel: "",
      floorPlaceholder: "",
      noteLabel: "",
      notePlaceholder: "",
      defaultName: "Parking Garage",
    },
  };

  function updateAddFormForCategory(category) {
    if (!labelHall || !labelFloor || !labelNote ||
            !inputHall || !inputFloor || !inputNote) {
      return;
    }

    const cfg = formConfigs[category] || formConfigs.study;

    labelHall.textContent = cfg.hallLabel;
    inputHall.placeholder = cfg.hallPlaceholder;
    if (category === "parkinggarages") {
      labelFloor.style.display = "none";
      inputFloor.style.display = "none";
      labelNote.style.display = "none";
      inputNote.style.display = "none";
    } else {
      labelFloor.style.display = "";
      inputFloor.style.display = "";
      labelNote.style.display = "";
      inputNote.style.display = "";
      labelFloor.textContent = cfg.floorLabel;
      labelNote.textContent = cfg.noteLabel;
      inputFloor.placeholder = cfg.floorPlaceholder;
      inputNote.placeholder = cfg.notePlaceholder;
    }
    inputHall.value = "";
    inputFloor.value = "";
    inputNote.value = "";
  }

  if (formCategory) {
    updateAddFormForCategory(formCategory.value);
    formCategory.addEventListener("change", function() {
      updateAddFormForCategory(this.value);
    });
  }

  let adding = false;
  let clickedCoords = null;

  const addBtn = document.getElementById("add-btn");
  const addForm = document.getElementById("add-form");
  const saveBtn = document.getElementById("save-location");
  const cancelBtn = document.getElementById("cancel-location");

  if (!addBtn || !addForm || !saveBtn || !cancelBtn) return;

  addBtn.addEventListener("click", () => {
    adding = !adding;
    if (adding) {
      addBtn.innerHTML = "Click map to choose location";
      addBtn.classList.add("adding");
      document.getElementById("map").classList.add("map-adding");
    } else {
      addBtn.innerHTML = "<i class=\"fas fa-plus\"></i> Add Location";
      addBtn.classList.remove("adding");
      document.getElementById("map").classList.remove("map-adding");
      addForm.classList.add("hidden");
    }
  });

  map.on("click", (e) => {
    if (!adding) return;
    clickedCoords = e.latlng;
    addForm.style.display = "block";
    addForm.classList.remove("hidden");
    addForm.scrollIntoView({behavior: "smooth", block: "center"});
  });

  saveBtn.addEventListener("click", () => {
    if (!clickedCoords || !formCategory) return;
    const category = formCategory.value;
    const field1 = inputHall ? (inputHall.value || "") : "";
    const field2 = inputFloor ? (inputFloor.value || "") : "";
    const note = inputNote ? (inputNote.value || "") : "";
    const iconOrColor = markerColors[category] || "#808080";
    const cfg = formConfigs[category] || formConfigs.study;

    const properties = {};
    if (category === "parkinggarages") {
      properties.name = field1 || cfg.defaultName || "Parking Garage";
    } else {
      properties.name = cfg.defaultName || "Location";
      if (category === "study") {
        properties.hall = field1 || "Unknown";
        properties.floor = field2 || "N/A";
      } else if (category === "busstops") {
        properties.stop = field1 || "Unknown stop";
        properties.route = field2 || "N/A";
      } else {
        properties.hall = field1 || "Unknown";
        properties.floor = field2 || "N/A";
      }

      if (note) {
        properties.note = note;
      }
    }
    const feature = {
      type: "Feature",
      properties: properties,
      geometry: {
        type: "Point",
        coordinates: [clickedCoords.lng, clickedCoords.lat],
      },
    };

    const marker = createCustomMarker(feature, clickedCoords, iconOrColor);
    onEachFeature(feature, marker);
    if (layerGroups[category]) {
      marker.addTo(layerGroups[category]);
    } else {
      marker.addTo(map);
    }
    addForm.classList.add("hidden");
    addBtn.innerHTML = "<i class=\"fas fa-plus\"></i> Add Location";
    addBtn.classList.remove("adding");
    document.getElementById("map").classList.remove("map-adding");
    adding = false;
    clickedCoords = null;

    if (inputHall) inputHall.value = "";
    if (inputFloor) inputFloor.value = "";
    if (inputNote) inputNote.value = "";
  });

  cancelBtn.addEventListener("click", () => {
    addForm.classList.add("hidden");
    addBtn.innerHTML = "<i class=\"fas fa-plus\"></i> Add Location";
    addBtn.classList.remove("adding");
    document.getElementById("map").classList.remove("map-adding");
    adding = false;
  });
});
