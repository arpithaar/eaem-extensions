(function ($, $document) {
    var FOUNDATION_CONTENT_LOADED = "foundation-contentloaded",
        GRANITE_OMNI_SEARCH_RESULT = "#granite-omnisearch-result",
        EAEM_SEARCH_PATH_COLUMN = "eaem-search-path-column",
        EAEM_SEARCH_PATH_COLUMN_HEADER = "Path",
        ROW_SELECTOR = "tr.foundation-collection-item",
        EAEM_SORT_PARAMETER = "eaem-search-parameter",
        SORT_DIRECTION_STORAGE_KEY = "apps.experienceaem.assets.searchSortDirection",
        STORAGE = window.localStorage,
        GRANITE_OMNI_SEARCH_CONTENT = ".granite-omnisearch-content";

    $document.on(FOUNDATION_CONTENT_LOADED, GRANITE_OMNI_SEARCH_CONTENT, function(event){
        _.defer(function(){
            handleContentLoad(event);
        });
    });

    $document.ready(function(){
        var $form = $(GRANITE_OMNI_SEARCH_CONTENT);

        STORAGE.removeItem(SORT_DIRECTION_STORAGE_KEY);

        addSortParameter($form, "nodename", "asc");
    });

    function removeSortParameter(){
        var $form = $(GRANITE_OMNI_SEARCH_CONTENT),
            $sortParam = $form.find("." + EAEM_SORT_PARAMETER);

        if(!_.isEmpty($sortParam)){
            $sortParam.remove();
        }
    }

    function addSortParameter($form, parameter, direction){
        removeSortParameter();

        $form.append(getSortHtml(parameter, direction));
    }

    function getSortHtml(parameter, direction){
        return  "<span class='" + EAEM_SORT_PARAMETER + "' >" +
                    "<input type='hidden' name='orderby' value='" + parameter + "'/>" +
                    "<input type='hidden' name='orderby.sort' value='" + direction + "'/>" +
                "</span>"
    }

    function handleContentLoad(event){
        var layout = $(GRANITE_OMNI_SEARCH_RESULT).data("foundationLayout");

        if(!layout || (layout.layoutId !== "list")){
            return;
        }

        addColumnHeaders();

        fillColumnData();
    }

    function handleSort(){
        var $form = $(GRANITE_OMNI_SEARCH_CONTENT),
            $th = $(this), sortBy = "nodename",
            thContent = $th.find("coral-table-headercell-content").html().trim(),
            direction = "ascending";

        if($th.attr("sortabledirection") == "ascending"){
            direction = "descending";
        }

        $th.attr("sortabledirection", direction);

        if(thContent == "Modified"){
            sortBy = "@jcr:content/cq:lastModified";
        }else if(thContent == "Path"){
            sortBy = "path";
        }

        STORAGE.setItem(SORT_DIRECTION_STORAGE_KEY, sortBy + "=" + direction);

        addSortParameter($form, sortBy, (direction == "descending" ? "desc" : "asc"));

        $form.submit();
    }

    function fillColumnData(){
        var $fui = $(window).adaptTo("foundation-ui");

        $fui.wait();

        $(ROW_SELECTOR).each(function(index, item){
            itemHandler($(item) );
        });

        function itemHandler($row){
            if(!_.isEmpty($row.find("[" + EAEM_SEARCH_PATH_COLUMN + "]"))){
                return;
            }

            if(_.isEmpty($row.find("td.foundation-collection-item-title"))){
                return;
            }

            var itemPath = $row.data("foundation-collection-item-id");

            $row.find("td:last").before(getListCellHtml(itemPath));
        }

        $fui.clearWait();
    }

    function getListCellHtml(colValue){
        return '<td is="coral-table-cell" ' + EAEM_SEARCH_PATH_COLUMN + ' >' + colValue + '</td>';
    }

    function addColumnHeaders(){
        if(checkIFHeadersAdded()){
            return;
        }

        var $container = $(GRANITE_OMNI_SEARCH_CONTENT),
            $headRow = $container.find("thead > tr"),
            sortBy, direction,
            $pathCol = $(getTableHeader(EAEM_SEARCH_PATH_COLUMN_HEADER)).appendTo($headRow).click(handleSort);

        sortBy = STORAGE.getItem(SORT_DIRECTION_STORAGE_KEY);

        if(_.isEmpty(sortBy)){
            sortBy = "nodename";
            direction = "ascending";
        }else{
            direction = sortBy.substring(sortBy.lastIndexOf("=") + 1);
            sortBy = sortBy.substring(0, sortBy.lastIndexOf("="));
        }

        var $nameCol = $headRow.find("th:eq(" + getIndex($headRow, "Name") + ")")
                        .attr("sortabledirection", "default")
                        .attr("sortable", "sortable").click(handleSort);

        var $modifiedCol = $headRow.find("th:eq(" + getIndex($headRow, "Modified") + ")")
                        .attr("sortabledirection", "default")
                        .attr("sortable", "sortable").click(handleSort);

        if(sortBy == "@jcr:content/cq:lastModified"){
            $modifiedCol.attr("sortabledirection", direction)
        }else if(sortBy == "path"){
            $pathCol.attr("sortabledirection", direction)
        }else{
            $nameCol.attr("sortabledirection", direction);
        }
    }

    function getIndex($headRow, header){
        return $headRow.find("th coral-table-headercell-content:contains('" + header + "')").closest("th").index();
    }

    function getTableHeader(colText) {
        return '<th is="coral-table-headercell" sortabledirection="default" sortable ' + EAEM_SEARCH_PATH_COLUMN + ' >'
                    + colText
                + '</th>';
    }

    function checkIFHeadersAdded(){
        return !_.isEmpty($(GRANITE_OMNI_SEARCH_CONTENT).find("tr").find("[" + EAEM_SEARCH_PATH_COLUMN + "]"));
    }
})(jQuery, jQuery(document));