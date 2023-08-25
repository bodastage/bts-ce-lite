/**

Copyright 2023 Bodastage Solutions Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
#include "bodabulkcmparser.h"
#include <iostream>
#include "fast-cpp-csv-parser/csv.h"
#include "spdlog/spdlog.h"
#include <regex>
#include "bodautils.h"
#include <filesystem>

namespace fs = std::filesystem;

bodastage::BodaBulkCmParser::BodaBulkCmParser()
{
}

void bodastage::BodaBulkCmParser::on_start_document(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{
}

void bodastage::BodaBulkCmParser::on_empty_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{
    on_start_element(inspector);
    on_end_element(inspector);
}

void bodastage::BodaBulkCmParser::on_end_document(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{
}

/**
 * @brief Get the number of occurrences of an XML tag in the xmlTagStack.
 * <p>
 * This is used to handle cases where XML elements with the same name are
 * nested.
 *
 * @param tagName String The XML tag name
 * @return Integer Number of tag occurrences.
 * @version 1.0.0
 * @since 1.0.0
 */
int bodastage::BodaBulkCmParser::get_xml_tag_occurences(string tag_name) {
    int tag_occurences = 0;

    for(auto tag : xml_tag_stack) {

        std::regex tag_regex("^(" + tag_name + "|" + tag_name + "_\\d+)$");

        if(std::regex_search(tag, tag_regex)) {
            tag_occurences++;
        }
    }
    return tag_occurences;
}


void bodastage::BodaBulkCmParser::on_start_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{  

    string start_element = inspector.GetName();
    string qName = inspector.GetLocalName();
    string prefix = inspector.GetPrefix();
    
    start_element_tag = qName;
    start_element_tag_prefix = prefix;

    //extract the dateTime from the footer during the first pass over the document i.e EXTRACTING_PARAMETERS stage
    if(qName == "fileFooter" && parser_state == EXTRACTING_PARAMETERS && inspector.HasAttributes()){
        Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
        for (i = 0; i < inspector.GetAttributesCount(); ++i){
            if(inspector.GetAttributeAt(i).Name == "dateTime"){
                date_time = inspector.GetAttributeAt(i).Value;
            }
        }
    }

    //E1:0. xn:VsDataContainer encountered
    //Push vendor speicific MOs to the xmlTagStack
    if (bodastage::tolower(qName) == "vsdatacontainer") {
        vs_dc_depth++;
        depth++;

        string vs_dc_tag_with_depth = "VsDataContainer_" + std::to_string(vs_dc_depth);
        xml_tag_stack.push_back(vs_dc_tag_with_depth);

        Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
        for (i = 0; i < inspector.GetAttributesCount(); ++i){
            if(inspector.GetAttributeAt(i).Name == "id"){
                std::map<string, string> m;
                m.insert(std::pair<string, string>(inspector.GetAttributeAt(i).Name, inspector.GetAttributeAt(i).Value));
                xml_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
            }
        }

        vs_data_type.clear();
        vs_data_type_stack.clear();
        vs_data_type_rl_stack.clear();
        return;
    }

    //E1:1 -- treat xn:vsData as an attribute so we don't increment the depth
    if (prefix != "xn" && bodastage::starts_with(qName, "vsData")) {
        vs_data_type = qName;

        string vs_dc_tag_with_depth = "VsDataContainer_" + std::to_string(vs_dc_depth);
        vs_data_container_type_map.insert(std::pair<string, string>(vs_dc_tag_with_depth, qName));

        return;
    }

    //E1.2
    if (!vs_data_type.empty()) {

        //Handle parameters with children
        //Update vsDataTypeStack and vsDataTypeRlStack
        if (vs_data_type_rl_stack.size() > 0) {
            string parent_parameter = vs_data_type_rl_stack.at(0);
            string child_parameter = qName;
            string param = parent_parameter + "_" + child_parameter;
            if (!vs_data_type_stack.count(param)) {
                vs_data_type_stack.insert(std::pair<string, string>(param, ""));
            }
            vs_data_type_rl_stack.push_back(qName);

            return;
        }

        //Handle parameters with no children
        if (!vs_data_type_stack.count(qName)) {
            vs_data_type_stack.insert(std::pair<string, string>(qName, ""));
            vs_data_type_rl_stack.push_back(qName);
        }
        return;
    }

    //E1.3
    if (qName == "attributes") {
        attr_marker = true;
        return;
    }

    //E1.4
    if ( std::find(xml_tag_stack.begin(), xml_tag_stack.end(), qName) != xml_tag_stack.end()) { //check if qName exists in xml_tag_stack
        depth++;
        int occurences = get_xml_tag_occurences(qName) + 1;
        string new_tag_name = qName + "_" + std::to_string(occurences);
        xml_tag_stack.push_back(new_tag_name);


        //Add XML attributes to the XML Attribute Stack.
        //@TODO: This while block is repeated below. The 2 should be combined
        Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
        for (i = 0; i < inspector.GetAttributesCount(); ++i){
            if (xml_attr_stack.count(depth)) {
                std::map<string, string> mm = xml_attr_stack.at(depth);
                mm.insert(std::pair<string, string>(inspector.GetAttributeAt(i).LocalName, inspector.GetAttributeAt(i).Value));
                xml_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, mm));
            }else{
                std::map<string, string> m;
                m.insert(std::pair<string, string>(inspector.GetAttributeAt(i).LocalName, inspector.GetAttributeAt(i).Value));
                xml_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
            }
        }

        return;
    }

    //E1.5 --<xn:attributes>
    if (attr_marker == true && vs_data_type.empty()) {
        //LOGGER.info("attrMarker == true && vsDataType == null qName="+ qName);
        //Tracks hierachy of tags under xn:attributes.
        xn_attr_rl_stack.push_back(qName);

        std::map<string, string> m;
        if(three_gpp_attr_stack.count(depth)){
            m = three_gpp_attr_stack.at(depth);
            if(m.count(qName) == 0){
                m.insert(std::pair<string, string>(qName, ""));
                three_gpp_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
            }

            m.insert(std::pair<string, string>(qName, ""));
            three_gpp_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
        }else{
            m.insert(std::pair<string, string>(qName, ""));
            three_gpp_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
        }

        return;
    }

    //E1.6
    //Push 3GPP Defined MOs to the xmlTagStack
    depth++;
    xml_tag_stack.push_back(qName);
    xml_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, std::map<string, string>()));
    Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
    for (i = 0; i < inspector.GetAttributesCount(); ++i){
        if (xml_attr_stack.count(depth)) {
            std::map<string, string> mm = xml_attr_stack.at(depth);
            mm.insert(std::pair<string, string>(inspector.GetAttributeAt(i).LocalName, inspector.GetAttributeAt(i).Value));
            xml_attr_stack[depth] = mm;
        }else{
            std::map<string, string> m;
            m.insert(std::pair<string, string>(inspector.GetAttributeAt(i).LocalName, inspector.GetAttributeAt(i).Value));
            xml_attr_stack.insert(std::pair<int, std::map<string, string>>(depth, m));
        }
    }
}

/**
 * Process given string into a format acceptable for CSV format.
 *
 * @param s String
 * @return String Formated version of input string
 * @since 1.0.0
 */
string bodastage::BodaBulkCmParser::to_csv_format(string s) {
    string csv_value = s;

    if (s.empty()) {
        // csv_value = "\"\"";
        csv_value = "";
        return csv_value;
    }

    //Check if value contains comma
    if(s.find(",") != string::npos ){
        csv_value = "\"" + s + "\"";
    }

    //handle value with double quotes
    //@todo: this solution only handles the first occurrence. we need to use a while loop
    if (s.find("\"") != string::npos) {
        csv_value = "\"" + s.replace(s.find("\""), 2, "\"\"") + "\"";
    }

    return csv_value;
}


    /**
     * Returns 3GPP defined Managed Objects(MOs) and their attribute values.
     * This method is called at the end of processing 3GPP attributes.
     *
     * @version 1.0.0
     * @since 1.0.0
     */
void bodastage::BodaBulkCmParser::process_3gpp_attributes(){
    string mo = xml_tag_stack.back(); // last element

    //Holds parameter-value map before printing
    std::map<string, string> xml_tag_values;
    //LOGGER.info("GOOD PLACE TO START " + " mo:" + mo);
    if (parameter_file.empty() == false && mo_three_gpp_attr_map.count(mo) == 0) {
        return;
    }

    string param_names = "FILENAME,DATETIME";
    string param_values = bulk_cm_xml_file_basename + "," + date_time;

    std::stack<string> ignore_tn_parameter_file;

    //Parent IDs
    for (int i = 0; i < (int)xml_tag_stack.size(); i++) {
        string parent_mo = xml_tag_stack.at(i);

        //The depth at each xml tag index is  index+1 since index starts at 0
        int depth_key = i + 1;

        //Iterate through the XML attribute tags for the element.
        if (xml_attr_stack.count(depth_key) == 0 && xml_attr_stack.at(depth_key).empty()) {
            continue; //Skip null values
        }

        std::map<string, string>::iterator mIter; 
        std::map<string, string> _xml_attr_stack = xml_attr_stack.at(depth_key);
        if(_xml_attr_stack.size() == 0) continue;

        for (mIter = _xml_attr_stack.begin(); mIter != _xml_attr_stack.end(); mIter++){
            string p_name = parent_mo + "_" + mIter->first;
            string p_value = to_csv_format(mIter->second);
            xml_tag_values.insert(std::pair<string, string>(p_name, p_value));
        }
    }

    //Some MOs dont have 3GPP attributes e.g. the fileHeader 
    //and the fileFooter
    if ( mo_three_gpp_attr_map.count(mo) > 0 && !mo_three_gpp_attr_map.at(mo).empty()) {
        //Get 3GPP attributes for MO at the current depth
        std::vector<string> a_3gpp_atrr = mo_three_gpp_attr_map.at(mo);
        std::map<string, string> current_3gpp_attrs;

        if (three_gpp_attr_stack.count(depth) > 0 && !three_gpp_attr_stack.at(depth).empty()) {
            current_3gpp_attrs = three_gpp_attr_stack.at(depth);
        }

        for (int i = 0; i < (int)a_3gpp_atrr.size(); i++) {
            string a_attr = a_3gpp_atrr.at(i);

            //Skip parameters listed in the parameter file that are in the xmlTagList already
    //                  if(ignoreInParameterFile.contains(aAttr)) continue;

            //Skip fileName, and dateTime in the parameter file as they are added by default
            if (bodastage::tolower(a_attr) == "filename" ||
                    bodastage::tolower(a_attr) == "datetime") continue;

            string a_value = "";

            if (xml_tag_values.count(a_attr)) {
                a_value = xml_tag_values.at(a_attr);
            }

            if (current_3gpp_attrs.count(a_attr)) {
                a_value = to_csv_format(current_3gpp_attrs.at(a_attr));
            }

            param_names = param_names + "," + a_attr;
            param_values = param_values + "," + a_value;
        }
    } else {
        //if there are not 3GPP Attributes(ie moThreeGPPAttrMap is empty), collect the XML attributes 
        std::map<string, string>::iterator mIter; 
        for (mIter = xml_tag_values.begin(); mIter != xml_tag_values.end(); mIter++){
            string p_name = mIter->first;
            string p_value = to_csv_format(mIter->second);

            param_names = param_names + "," + p_name;
            param_values = param_values + "," + p_value;
        }

    }

    //Write the 3GPP defined MOs to files.
    if (output_3gpp_mo_pw_map.count(mo) == 0) {

        //Rename conflicting csv files on windows
        string renamed_file_name = mo;
        //@TODO: rename conflicting file names on windows since file names are case insensitive
        if ( bodastage::get_sep() == "\\") {
            if (mo_to_file_name_map.count(mo)) renamed_file_name = mo_to_file_name_map.at(mo);
        }

        string mo_file = output_directory + bodastage::get_sep() + renamed_file_name + ".csv";
        try {
            output_3gpp_mo_pw_map.insert(std::pair<string, ofstream>(mo, ofstream(mo_file)));
            output_3gpp_mo_pw_map.at(mo) << param_names << '\n';
        } catch (std::exception e) {
            spdlog::error(e.what());
        }
    }

    output_3gpp_mo_pw_map.at(mo) << param_values << '\n';
}

/**
 * @brief Save a values for Three GPP attribute values .
 * 
 * @details This should be called at the end of </attributes>
 *
 * @param mo
 */
void bodastage::BodaBulkCmParser::save_three_gpp_attr_values(string mo) {
    three_gpp_attr_values.clear();

    //Some MOs dont have 3GPP attributes e.g. the fileHeader 
    //and the fileFooter
    if (mo_three_gpp_attr_map.count(mo) && !mo_three_gpp_attr_map.at(mo).empty()) {
        //Get 3GPP attributes for MO at the current depth
        std::vector<string> a_3gpp_atrr = mo_three_gpp_attr_map.at(mo);
        std::map<string, string> current_3gpp_attrs;

        //We are assuming the vsDataSomeMO is an immediate child of SomeMO
//              if (!threeGPPAttrStack.isEmpty() && threeGPPAttrStack.get(depth-2) != null) {
//                  current3GPPAttrs = threeGPPAttrStack.get(depth);
//              }

        if (three_gpp_attr_stack.count(depth)) {
            current_3gpp_attrs = three_gpp_attr_stack.at(depth);
        }

        for (int i = 0; i < (int)a_3gpp_atrr.size(); i++) {
            string a_attr = a_3gpp_atrr.at(i);
            

            //Skip parameters listed in the parameter file that are in the xmlTagList already
//                  if(ignoreInParameterFile.contains(aAttr)) continue;

            //Skip fileName, and dateTime in the parameter file as they are added by default
            if (bodastage::tolower(a_attr) == "filename" ||
                    bodastage::tolower(a_attr) == "datetime") continue;

            string a_value = "";

            if (current_3gpp_attrs.count(a_attr)) {
                a_value = to_csv_format(current_3gpp_attrs.at(a_attr));
            } else {
                //Only take the current Attri but maitain the order in 
                //a3GPPAtrr i.e. moThreeGPPAttrMap
                continue;
            }
            three_gpp_attr_values.insert( std::pair<string, string>(a_attr, a_value));
        }
    }
}

/**
 * Print vendor specific attributes. The vendor specific attributes start
 * with a vendor specific namespace.
 *
 * @verison 2.0.0
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::process_vendor_attributes() { 
    //Skip if the mo is not in the parameterFile
    if (!parameter_file.empty() && mo_columns.count(vs_data_type) == 0) {
        return;
    }

    string param_names = "FILENAME,DATETIME";
    string param_values = bulk_cm_xml_file_basename + "," + date_time;

    std::map<string, string> parent_id_values;

    //Parent MO IDs
    for (int i = 0; i < (int)xml_tag_stack.size(); i++) {

        //Get parent tag from the stack
        string parent_mo = xml_tag_stack.at(i);

        //The depth at each XML tag in xmlTagStack is given by index+1. 
        int depth_key = i + 1;

        //If the parent tag is VsDataContainer, look for the 
        //vendor specific MO in the vsDataContainer-to-vsDataType map.
        if (bodastage::starts_with(bodastage::tolower(parent_mo), "vsdatacontainer")) {
            parent_mo = vs_data_container_type_map.at(parent_mo);
        }

        std::map<string, string> m;
        if (xml_attr_stack.count(depth_key)) m = xml_attr_stack.at(depth_key);
        if (m.empty()) continue;

        //If we dont't want to separate the vsDataMo from the 3GPP mos
        //strip vsData From the MOs Ids ie.e vsDataSomeMO_id becomes SomeMO_id
        if (separate_vendor_attributes == false) {
            parent_mo = bodastage::str_replace(parent_mo, "vsData", "vs");
        }

        std::map<string, string>::iterator aIter; 
        for (aIter = xml_attr_stack.at(depth_key).begin(); aIter != xml_attr_stack.at(depth_key).end(); aIter++){
            string p_name = parent_mo + "_" + aIter->first;
            string p_value = to_csv_format(aIter->second);
            parent_id_values.insert(std::pair<string, string>(p_name, p_value));
        }
    }

    
    //3GPP MO. It has been moved her for use in combining attr that exist in 
    //the vendor attr and 3GPP attr list
    string three_ggp_mo = bodastage::str_replace(vs_data_type, "vsData", "");
    
    //Check for if 3GPP ofr MO exists
    // bool tgpp_exists = mo_three_gpp_attr_map.count(three_ggp_mo) > 0;
    
    //Get the 3GPP attributes
    std::vector<string> _3gpp_attr;
    if (mo_three_gpp_attr_map.count(three_ggp_mo)){
        _3gpp_attr = mo_three_gpp_attr_map.at(three_ggp_mo);
    }

    
    //Make copy of the columns first i.e the vendor attributes
    std::vector<string> columns;

    columns = mo_columns.at(vs_data_type); //@todo: change mo_columns to a vector
    //Iterate through the columns already collected
    for (int i = 0; i < (int)columns.size(); i++) {
        string p_name = columns.at(i);
        

        //This strips vsData from vsDataSomeMO_Attribute e.g
        //vsDataGsmCell_id becaomes GsmCell_id
        if (separate_vendor_attributes == false) {
            //Skip vsDataSomeMO_Id
            //if( pName.equals(vsDataType + "_id") ) continue;

            //Remove vsData from vsDataSomeMO_id to vsSomeMO_id
            p_name = bodastage::str_replace(p_name, "vsData", "vs");
        }


        //Skip parent parameters/ parentIds listed in the parameter file
//            if( parameterFile != null && moColumnsParentIds.get(vsDataType).contains(pName)) continue;

        if (p_name == "FILENAME" || p_name == "DATETIME") continue;

        string p_value = "";

        //Check parameter ids fro parameter name
        if (parent_id_values.count(p_name)) {
            p_value = parent_id_values.at(p_name);
        }

        //
        if (vs_data_type_stack.count(p_name)) {
            p_value = to_csv_format(vs_data_type_stack.at(p_name));
        }

        //Handle parameters that exist in 3GGP attr list too i.e in moThreeGPPAttrMap
        bool p_name_in_3gpp_attr = std::find(_3gpp_attr.begin(), _3gpp_attr.end(), p_name) != _3gpp_attr.end();
        if(p_value.length() == 0 &&  p_name_in_3gpp_attr){
            if (three_gpp_attr_values.count(p_name)) p_value = three_gpp_attr_values.at(p_name);
        }
        param_names = param_names + "," + p_name;
        param_values = param_values + "," + p_value;
    }


    //If we dont't want to separate the vsDataMo from the 3GPP mos
    //strip vsData From the MOs, we must print the 3GPP mos here .
    //Get the parameter names and values of the 3GPP MOs
    //@TODO: Handle parameter file
    
    //String threeGGPMo = vsDataType.replace("vsData", "");
    
    //Replace to fix bug
    //if (separateVendorAttributes == false && xmlTagStack.contains(threeGGPMo)) {
    if (separate_vendor_attributes == false && mo_three_gpp_attr_map.count(three_ggp_mo)) {
        
        //Moved to the top just before collecting the vendor attribute values
        //Stack _3gppAttr = new Stack();
        //if (!moThreeGPPAttrMap.isEmpty() && moThreeGPPAttrMap.containsKey(threeGGPMo)){
        //    _3gppAttr = moThreeGPPAttrMap.get(threeGGPMo);
        //}
        for (int idx = 0; idx < (int)_3gpp_attr.size(); idx++) {
            string p_name = _3gpp_attr.at(idx);
            string p_value = "";

            //Skip parameters that already exist in the vendor attr list 
            // if(columns.contains(p_name)) continue;
            if(std::find(columns.begin(), columns.end(), p_name) != columns.end()) continue;
            
            //Skip _id  and bulkCmConfigDataFile_schemaLocationfileds
            if (bodastage::ends_with(p_name, "_id") || p_name == "bulkCmConfigDataFile_schemaLocation" ) continue;

            if (three_gpp_attr_values.count(p_name)) p_value = three_gpp_attr_values.at(p_name);

            param_names = param_names + "," + p_name;
            param_values = param_values + "," + p_value;
        }
    }

    string csv_file_name = vs_data_type;

    //Remove vsData if we don't want to separate the 3GPP and vendor attributes
    if (separate_vendor_attributes == false) csv_file_name = bodastage::str_replace(csv_file_name, "vsData", "");
    
    //Write the parameters and values to files.
    if (output_vs_data_type_pw_map.count(csv_file_name) == 0) {
        string renamed_file_name = csv_file_name;
        if ( bodastage::get_sep() == "\\") { //windows
            if (mo_to_file_name_map.count(csv_file_name)) renamed_file_name = mo_to_file_name_map.at(csv_file_name);
        }

        string mo_file = output_directory + bodastage::get_sep() + renamed_file_name + ".csv";
        try {
            output_vs_data_type_pw_map.insert(std::pair<string, ofstream>(csv_file_name, ofstream(mo_file)));   //(csv_file_name, ofstream(mo_file));
            output_vs_data_type_pw_map.at(csv_file_name) << param_names << '\n';
        } catch (std::exception e) {
            spdlog::error(e.what());
        }

    }

    output_vs_data_type_pw_map.at(csv_file_name) << param_values << '\n';;


}

/**
 * @brief Update the map of 3GPP MOs to attributes.
 * 
 * @details This is necessary to ensure the final output in the csv is aligned.
 *
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::update_three_gpp_attr_map() {
    if (xml_tag_stack.empty()) return;

    string mo = xml_tag_stack.back();

    //Skip 3GPP MO if it is not in the parameter file
    if (!parameter_file.empty() && mo_three_gpp_attr_map.count(mo) == 0) return;

    //Hold the current 3GPP attributes
    std::map<string, string> tgpp_attrs;

    std::vector<string> attrs;

    //Initialize if the MO does not exist
    if (mo_three_gpp_attr_map.count(mo) == 0) {
        mo_three_gpp_attr_map.insert(std::pair<string, std::vector<string>>(mo, std::vector<string>()));
    }

    //The attributes stack can be empty if the MO has no 3GPP attributes
    if (three_gpp_attr_stack.empty() || three_gpp_attr_stack.at(depth).empty()) {
        return;
    }
    tgpp_attrs = three_gpp_attr_stack.at(depth);

    attrs = mo_three_gpp_attr_map.at(mo);

    //Add Parent IDs as parameters
    for (int i = 0; i < (int)xml_tag_stack.size(); i++) {
        string parent_mo = xml_tag_stack.at(i);

        //The depth at each xml tag index is  index+1 
        int depth_key = i + 1;

        //Iterate through the XML attribute tags for the element.
        if (xml_attr_stack.at(depth_key).empty()) {
            continue; //Skip null values
        }

        std::map<string, string>::iterator mIter; 
        for (mIter = xml_attr_stack.at(depth_key).begin(); mIter != xml_attr_stack.at(depth_key).end(); mIter++){
            string p_name = parent_mo + "_" + mIter->first;

            bool p_name_in_attrs = std::find(attrs.begin(), attrs.end(), p_name) != attrs.end();
            if(!p_name_in_attrs && parameter_file.empty()){
                attrs.push_back(p_name);
            }

        }

    }


    if (!tgpp_attrs.empty()) {
        //Get vendor specific attributes
        std::map<string, string>::iterator iter; 
        for (iter = tgpp_attrs.begin(); iter != tgpp_attrs.end(); iter++){
            string parameter = iter->first;
            
            bool p_name_in_attrs = std::find(attrs.begin(), attrs.end(), parameter) != attrs.end();
            if(!p_name_in_attrs && parameter_file.empty()){
                attrs.push_back(parameter);
            }
        }

        mo_three_gpp_attr_map[mo] = attrs;
    }
}


void bodastage::BodaBulkCmParser::on_end_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector){
    string prefix = inspector.GetPrefix();
    string qName = inspector.GetLocalName();

    start_element_tag = "";

    //E3:1 </xn:VsDataContainer>
    if (bodastage::str_contains(bodastage::tolower(qName), "vsdatacontainer")) {
        string vs_dc_tag = "VsDataContainer_" + std::to_string(vs_dc_depth);
        xml_tag_stack.pop_back();
        if (xml_attr_stack.count(depth)) {
            xml_attr_stack.erase(depth);
            three_gpp_attr_stack.erase(depth);
        }
        if (vs_data_container_type_map.count(std::to_string(vs_dc_depth))) vs_data_container_type_map.erase(std::to_string(vs_dc_depth));
        vs_dc_depth--;
        depth--;
        return;
    }
    //We are at the end of </attributes> in 3GPP tag and VsDataContainer is the last tag in the xml tag stack
    if (qName == "attributes" && !bodastage::starts_with(bodastage::tolower(xml_tag_stack.back()), "vsdatacontainer")) {
        //Collect values for use when separateVsData is false
        if (parser_state == EXTRACTING_VALUES &&
                separate_vendor_attributes == false &&
                vs_data_type.empty()) {
            int xml_tag_stack_size = xml_tag_stack.size();
            //@TODO: Keep copy of attribute values
            if (xml_tag_stack_size > 1) {
                string tag_before_current_vs_container = xml_tag_stack.at(xml_tag_stack_size - 1);
                save_three_gpp_attr_values(tag_before_current_vs_container);
            }
        }
    }

    //3.2 </xn:attributes>
    if (qName == "attributes") {
        attr_marker = false;
        if (parser_state == EXTRACTING_PARAMETERS && vs_data_type.empty()) {
            update_three_gpp_attr_map();
        }
        
        return;
    }

    //E3:3 xx:vsData<VendorSpecificDataType>
    //if (bodastage::starts_with(qName, "vsData") && !qName.equalsIgnoreCase("VsDataContainer")
    if (bodastage::starts_with(bodastage::tolower(qName), "vsdata") && bodastage::tolower(qName) != "vsdatacontainer" && prefix != "xn") { //This skips xn:vsDataType
        if (EXTRACTING_PARAMETERS == parser_state) {
            collect_vendor_mo_columns();
        } else {
            process_vendor_attributes();
        }

        vs_data_type.clear();
        vs_data_type_stack.clear();
        return;
    }

    //E3:4
    //Process parameters under <bs:vsDataSomeMO>..</bs:vsDataSomeMo>
    if (!vs_data_type.empty() && attr_marker == true) {//We are processing vsData<DataType> attributes
        string new_tag = qName;
        string new_value = tag_data;

        //Note end of the parent-child
        if (vs_data_type_rl_stack.size() == 1 && in_parent_child_tag == true) {
            in_parent_child_tag = false;
        }

        //Handle attributes with children
        //inParentChildTag== false, means we have completed processing the children
        if (parent_child_parameters.count(qName) && in_parent_child_tag == false) {//End of parent tag

            //Ware at the end of the parent tag so we remove the mapping
            //as the child values have already been collected in 
            //vsDataTypeStack.
            parent_child_parameters.erase(qName);

            //The top most value on the stack should be qName
            if (vs_data_type_rl_stack.size() > 0) {
                vs_data_type_rl_stack.pop_back();
            }

            //Remove the parent tag from the stack so that we don't output 
            //data for it. It's values are taked care of by its children.
            vs_data_type_stack.erase(qName);
            return;
        }

        //If size is greater than 1, then there is parent with chidren
        if (vs_data_type_rl_stack.size() > 1) {
            int len = vs_data_type_rl_stack.size();
            string parent_tag = vs_data_type_rl_stack.at(len - 2);
            new_tag = parent_tag + parent_child_attr_seperator + qName;
            in_parent_child_tag = true;

            //Store the parent and it's child
            parent_child_parameters.insert(std::pair<string, string>(parent_tag, qName));

        }

        //Handle multivalued paramenters
        if (vs_data_type_stack.count(new_tag)) {
            if (!vs_data_type_stack.at(new_tag).empty()) {
                new_value = vs_data_type_stack.at(new_tag) + multi_value_separetor + tag_data;
            }
        }

        //@TODO: Handle cases of multi values parameters and parameters with children
        //For now continue as if they do not exist
        vs_data_type_stack.insert(std::pair<string, string>(new_tag, new_value));
        vs_data_type_stack[new_tag] = new_value; //add because  value is empty with insert
        tag_data = "";
        if (vs_data_type_rl_stack.size() > 0) {
            vs_data_type_rl_stack.pop_back();
        }
    }
    
    //E3.5
    //Process tags under xn:attributes.
    if (attr_marker == true && vs_data_type.empty()) {
        string new_value = tag_data;
        string new_tag = qName;

        //Handle attributes with children.Do this when parent end tag is 
        //encountered.
        if (attr_parent_child_map.count(qName)) { //End of parent tag
            //Remove parent child map
            attr_parent_child_map.erase(qName);

            //Remove the top most value from the stack.
            xn_attr_rl_stack.pop_back();

            //Remove the parent from the threeGPPAttrStack so that we 
            //don't output data for it.
            std::map<string, string> tre_map = three_gpp_attr_stack.at(depth);
            tre_map.erase(qName);
            three_gpp_attr_stack[depth] = tre_map;

            return;
        }

        //Handle parent child attributes. Get the child value
        int xn_attr_rl_stack_len = xn_attr_rl_stack.size();
        if (xn_attr_rl_stack_len > 1) {
            string parent_xn_attr
                    = xn_attr_rl_stack.at(xn_attr_rl_stack_len - 2);
            new_tag = parent_xn_attr + parent_child_attr_seperator + qName;

            //Store parent child map
            attr_parent_child_map.insert(std::pair<string, string>(parent_xn_attr, qName));

            //Remove the child tag from the 3gpp xnAttribute stack
            std::map<string, string> c_map = three_gpp_attr_stack.at(depth);
            if (c_map.count(qName)) {
                c_map.erase(qName);
                three_gpp_attr_stack.insert(std::pair(depth, c_map));
            }
        }

        std::map<string, string> m;
        m = three_gpp_attr_stack.at(depth);

        //For multivaluted attributes , first check that the tag already 
        //exits.
        if (m.count(new_tag) && m.at(new_tag).empty() == false) {
            string old_value = m.at(new_tag);
            string val = old_value + multi_value_separetor + new_value;
            m[new_tag] = val;
        } else {
            m.insert(std::pair<string, string>(new_tag, new_value));
            m[new_tag] = new_value;
        }

        three_gpp_attr_stack[depth] =  m;
        tag_data = "";
        xn_attr_rl_stack.pop_back();
        return;
    }

    //E3:6 
    //At this point, the remaining XML elements are 3GPP defined Managed 
    //Objects. 
    if (bodastage::value_in_vector(xml_tag_stack, qName)) {
        string the_tag = qName;

        //@TODO: This occurences check does not appear to be of any use; test 
        // and remove if not needed.
        int occurences = get_xml_tag_occurences(qName);
        if (occurences > 1) {
            the_tag = qName + "_" + std::to_string(occurences);
        }

        //Extracting parameter value stage.
        //Printout values ifthere is no matching vsDataMO  and separateVsData is true
        string vs_data_mo = "vsData" + qName; //This create vsDataMO
        if (parser_state != EXTRACTING_PARAMETERS &&
                (separate_vendor_attributes == true ||
                        (mo_columns.count(vs_data_mo) == false && separate_vendor_attributes == false)
                )
        ) {
            process_3gpp_attributes();
        }

        three_gpp_attr_values.clear();
        xml_tag_stack.pop_back();
        xml_attr_stack.erase(depth);
        three_gpp_attr_stack.erase(depth);
        depth--;
    }
}

void bodastage::BodaBulkCmParser::on_characters(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector){
    tag_data = inspector.GetValue();
}

void bodastage::BodaBulkCmParser::on_comment(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector)
{
}


void bodastage::BodaBulkCmParser::get_date_time(string input_filename) {
    try {
        //base_file_name = bulk_cm_xml_file_basename = get_file_basename(input_filename);
        Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(input_filename);

        while (inspector.Inspect()) {
            switch (inspector.GetInspected()) {
                case Xml::Inspected::StartTag:
                case Xml::Inspected::EmptyElementTag:
                    if (inspector.GetName() == "fileFooter") {
                            Xml::Inspector<Xml::Encoding::Utf8Writer>::SizeType i;
                            for (i = 0; i < inspector.GetAttributesCount(); ++i){
                                    if(inspector.GetAttributeAt(i).Name == "dateTime"){
                                        date_time = inspector.GetAttributeAt(i).Value;
                                        return;
                                    }
                            }
                    }
                    break;
                default:
                    // Ignore the rest of elements.
                    break;
            }
        }
    
    } catch (std::exception e) {
        spdlog::error(e.what());
    }
}

/**
 * @brief  parameter list from  parameter file
 *
 * @details mo:param1,param2,param3
 * @param filename
 */
void bodastage::BodaBulkCmParser::get_parameters_to_extract(string filename) {
     io::CSVReader<2, io::trim_chars<' ', '\t'>, io::no_quote_escape<':'>> in(filename);
     in.read_header(io::ignore_extra_column, "mo", "parameters");
     std::string mo; std::string parameters;

     while(in.read_row(mo, parameters)){
      // do stuff with the data
      std::vector<std::string> parameter_list = bodastage::split_str(parameters, ",");
      std::vector<std::string> parameter_stack;
      for (int i = 0; i < (int)parameter_list.size(); i++) {
            parameter_stack.push_back(parameter_list[i]);
      }

      if (mo.rfind("vsData", 0) == 0) {
          mo_columns.insert(std::pair<std::string,std::vector<string>>(mo, parameter_stack));
          mo_columns_parent_ids.insert(std::pair<std::string, std::vector<string>>(mo, std::vector<string>()));
      }else{
        mo_three_gpp_attr_map.insert( std::pair<std::string, std::vector<string>>(mo, parameter_stack));
      }
    }

    //Move to the parameter value extraction stage
    //parser_state = ParserStates.EXTRACTING_VALUES;
}


/**
 * @param input_filename
 */
void bodastage::BodaBulkCmParser::parse_file(string input_filename) {
    Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(input_filename);
    base_file_name = bulk_cm_xml_file_basename = bodastage::get_file_basename(input_filename);

    while (inspector.Inspect())
    {
        switch (inspector.GetInspected())
        {
            case Xml::Inspected::StartTag:
                on_start_element(inspector);
                break;
            case Xml::Inspected::EndTag:
                on_end_element(inspector);
                break;
            case Xml::Inspected::EmptyElementTag:
                on_empty_element(inspector);
                break;
            case Xml::Inspected::Text:
                on_characters(inspector);
                break;
            case Xml::Inspected::Comment:
                on_comment(inspector);
                break;
            default:
                // Ignore the rest of elements.
                break;
        }
    }

    if (inspector.GetErrorCode() != Xml::ErrorCode::None)
    {
        string error_msg = "";
        error_msg.append("row:" +  std::to_string(inspector.GetRow()));
        error_msg.append("colum:" +  std::to_string(inspector.GetColumn()));
       // error_msg.append("message" + inspector.GetErrorMessage());

       throw(error_msg);

    }
}

void bodastage::BodaBulkCmParser::set_parameter_file(string filename) {
    parameter_file = filename;
}

/**
 * @brief Set multi-value separator
 *
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::set_multi_value_separator(string mv_separator) {
    multi_value_separetor = mv_separator;
}

/**
 * @brief Separate vendor specifiic attributes from 3GPP attributes
 *
 * @since 2.1.0
 */
void bodastage::BodaBulkCmParser::set_separate_vendor_attributes(bool separate) {
    separate_vendor_attributes = separate;
}

/**
 * Determines if the source data file is a regular file or a directory and
 * parses it accordingly
 *
 * @throws XMLStreamException
 * @throws FileNotFoundException
 * @throws UnsupportedEncodingException
 * @version 1.0.0
 * @since 1.1.0
 */
void bodastage::BodaBulkCmParser::process_file_or_directory(){
    fs::path path(data_source);

    bool is_regular_executable_file = bodastage::is_regular_file(path) && bodastage::file_is_readable(path);

    bool is_readable_directory = bodastage::is_directory(path)  && bodastage::file_is_readable(path);

    if (is_regular_executable_file) {
        set_file_name(data_source);

        base_file_name = bodastage::get_file_basename(data_file);
        if (parser_state == EXTRACTING_PARAMETERS) {
            spdlog::info("Extracting parameters from {}...", base_file_name );
        } else {
            spdlog::info("Parsing {} ...",  base_file_name);
        }

        //Get date time 
        get_date_time(data_source);

        //Parse file
        parse_file(data_source);

        if (parser_state == EXTRACTING_PARAMETERS) {
            spdlog::info("Done.");
        } else {
            spdlog::info("Done.");
        }
    }

    if (is_readable_directory) {

        //get all the files from a directory
        for (const auto & entry : fs::directory_iterator(path)){
            set_file_name(entry.path().string());

            try{
                base_file_name = bodastage::get_file_basename(data_file);
                if(parser_state == EXTRACTING_PARAMETERS){
                    spdlog::info("Extracting parameters from {}...", base_file_name );
                }else{
                    spdlog::info("Parsing {} ...",  base_file_name);
                }

                get_date_time(entry.path().string());

                parse_file(entry.path().string());

                if(parser_state == EXTRACTING_PARAMETERS){
                    spdlog::info("Done.");
                }else{
                    spdlog::info("Done.");
                }
            }catch(std::exception e){
                spdlog::error(e.what());
                spdlog::warn("Skipping file: {} \n", base_file_name);
                reset_variables();
            }
        }
    }
}

/**
 * @brief Collect parameters for vendor specific MO data
 */
void bodastage::BodaBulkCmParser::collect_vendor_mo_columns() {
    //If MO is not in the parameter list, then don't continue
    if (parameter_file.empty() == false && mo_columns.count(vs_data_type) == 0) return;

    if (mo_columns.count(vs_data_type) == 0) {
        mo_columns.insert(std::pair<string, std::vector<string>>(vs_data_type, std::vector<string>()));
        mo_columns_parent_ids.insert(std::pair<string, std::vector<string>>(vs_data_type, std::vector<string>())); //Holds parent element IDs
    }

    std::vector<string> s = mo_columns.at(vs_data_type);
    std::vector<string> parent_id_stack = mo_columns_parent_ids.at(vs_data_type);

    //
    //Parent IDs
    for (int i = 0; i < (int)xml_tag_stack.size(); i++) {
        string parent_mo = xml_tag_stack.at(i);

        //If the parent tag is VsDataContainer, look for the 
        //vendor specific MO in the vsDataContainer-to-vsDataType map.
        if (bodastage::starts_with(bodastage::tolower(parent_mo), "vsdatacontainer")) {
            parent_mo = vs_data_container_type_map.at(parent_mo);
        }

        //The depth at each xml tag index is  index+1 
        int depth_key = i + 1;

        //Iterate through the XML attribute tags for the element.
        if (xml_attr_stack.at(depth_key).empty()) {
            continue; //Skip null values
        }
        
        std::map<string, string>::iterator mIter; 
        for (mIter = xml_attr_stack.at(depth_key).begin(); mIter != xml_attr_stack.at(depth_key).end(); mIter++){
            string p_name = parent_mo + "_" + mIter->first;

            if (!bodastage::value_in_vector(parent_id_stack, p_name)) {
                parent_id_stack.push_back(p_name);
            }

            if (parameter_file.empty() && bodastage::value_in_vector(s, p_name) == false) {
                s.push_back(p_name);
            }
        }
    }

    mo_columns_parent_ids[vs_data_type] = parent_id_stack;

    //Only update hte moColumns list if the parameterFile is not set
    //else use the list provided in the parameterFile
    if (parameter_file.empty()) {
        //Get vendor specific attributes
        std::map<string, string>::iterator iter; 
        for (iter = vs_data_type_stack.begin(); iter != vs_data_type_stack.end(); iter++){
            string parameter = iter->first;
            if(!bodastage::value_in_vector(s, parameter)){
                s.push_back(parameter);
            }
        }

        mo_columns[vs_data_type] = s;
    }

}



/**
 * @brief Collect MO Parameters
 *
 * @param input_file
 * @param output_directory
 */
void bodastage::BodaBulkCmParser::collect_mo_parameters(string input_file, string output_directory) {

    try {
        //Confirm that the output directory is a directory and has write 
        //privileges
        if (!bodastage::is_directory(fs::path(output_directory))) {
            spdlog::error("ERROR: The specified output directory is not a directory!.");
            throw std::runtime_error("ERROR: The specified output directory is not a directory!.");
            exit(1);

        }

        if (!bodastage::file_is_writable(fs::path(output_directory))) {
            spdlog::error("ERROR: The specified output directory is not writable!.");
            throw std::runtime_error("ERROR: The specified output directory is not writable!.");
            exit(1);
        }

        Xml::Inspector<Xml::Encoding::Utf8Writer> inspector(input_file);
            base_file_name = bulk_cm_xml_file_basename = bodastage::get_file_basename(input_file);

        while (inspector.Inspect())
        {
            switch (inspector.GetInspected())
            {
                case Xml::Inspected::StartTag:
                    on_start_element(inspector);
                    break;
                case Xml::Inspected::EndTag:
                    on_end_element(inspector);
                    break;
                case Xml::Inspected::EmptyElementTag:
                    on_empty_element(inspector);
                    break;
                case Xml::Inspected::Text:
                    on_characters(inspector);
                    break;
                case Xml::Inspected::Comment:
                    on_comment(inspector);
                    break;
                default:
                    // Ignore the rest of elements.
                    break;
            }
        }

        if (inspector.GetErrorCode() != Xml::ErrorCode::None){
            spdlog::error("row:{}, colum:{}, ",  inspector.GetRow(), inspector.GetColumn(), inspector.GetErrorMessage());
            string error_msg = "";
            error_msg.append("row:" +  std::to_string(inspector.GetRow()));
            error_msg.append("colum:" +  std::to_string(inspector.GetColumn()));
        throw(error_msg);

        }
    } catch (std::exception e) {
        spdlog::error(e.what());
        exit(1);
    }

}




/**
 * @brief Close file print writers.
 *
 * @version 1.0.0
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::close_mo_pw_map() {

    std::map<string, ofstream>::iterator mIter; 
    for (mIter = output_vs_data_type_pw_map.begin(); mIter != output_vs_data_type_pw_map.end(); mIter++){

        mIter->second.close();
    }
    output_vs_data_type_pw_map.clear();
    

    //Close 3GPP MO files.
    std::map<string, ofstream>::iterator iIter; 
    for (iIter = output_3gpp_mo_pw_map.begin(); iIter != output_3gpp_mo_pw_map.end(); iIter++){

        iIter->second.close();
    }
    output_3gpp_mo_pw_map.clear();
    
}

void bodastage::BodaBulkCmParser::print_execution_time(){
    //@TODO: add compute execution time i.e start -end time
}


/**
 * Parser entry point
 *
 */
void bodastage::BodaBulkCmParser::parse(){
    //Extract parameters
    if (parser_state == EXTRACTING_PARAMETERS) {
        process_file_or_directory();

        parser_state = EXTRACTING_VALUES;
    }

    //Reset variables
    reset_variables();
    spdlog::info("=============================================================.");

    //Extracting values
    if (parser_state == EXTRACTING_VALUES) {
        process_file_or_directory();
        parser_state = EXTRACTING_DONE;
    }

    close_mo_pw_map();

    print_execution_time();
}

/**
 * @brief  name of file to parser.
 *
 * @param filename
 * @version 1.0.0
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::set_file_name(string filename) {
    data_file = filename;
}

/**
 * @brief  name of file to parser.
 *
 * @param dataSource
 * @version 1.0.0
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::set_data_source(string ds) {
    data_source = ds;
}

/**
 * @brief Set the output directory.
 *
 * @param directoryName
 * @version 1.0.0
 * @since 1.0.0
 */
void bodastage::BodaBulkCmParser::set_output_directory(string dir_name) {
    output_directory = dir_name;
}


void bodastage::BodaBulkCmParser::reset_variables() {
    //Reset variables
    vs_data_type.clear();
    vs_data_type_stack.clear();
    xml_attr_stack.clear();
    xml_tag_stack.clear();
    vs_data_type_rl_stack.clear();
    start_element_tag.clear();
    start_element_tag_prefix = "";
    attr_marker = false;
    depth = 0;
}

