| [Home](../README.md) |
|----------------------|

# Installation
1. To install a widget, click **Content Hub** > **Discover**.
2. From the list of widgets that appears, search for and select **Top X** widget.
3. Click the **Top X** widget card.
4. Click **Install** on the lower part of the screen to begin installation.

# Configuration

The following sections lay out information necessary to customize this widget.

## Record Containing JSON Data

| Fields                                     | Description  |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| JSON Data Source Modules                   | Select the module from which to fetch the data                                                                                                            |
| Select Field                               | Select the field(Column) of the module which contains the `JSON` data                                                                                     |
| Filter Record Which Contains The JSON Data | Add conditions to retrieve only the records meeting the filter conditions. If multiple records match the conditions given, the first record is considered.|
**Advanced Settings**
| Update Content On Receiving Event | Toggle button to enable or disable the Event Listning |
| Event Name | Enter the event name, the event name should be similar to the event name mentioned in  the broadcasting widget |

##  Count of Records Across Module 

| Fields          | Description                                                                                                                     |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------|
| Title           | Specify the heading for Top-X            |
| Data Source     | Select the Module which has JSON data.                     |
| Filter  Condition | Filter Record Which Contains The JSON Data. It is recommended to apply filter, that filters out 1 record, i.e. by a unique field.                   |
| Select Field     | Select a field from the module which has the JSON data.|
|Enter the key of object to be rendered. | Specify the key under which the entire data is present, if the JSON data is already in the required format in the record, then leave the key field empty |

| [Usage](./usage.md) |
|---------------------|